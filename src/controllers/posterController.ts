import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Poster, Template, GenerationLog } from '../models';
import { config } from '../config';
import { asyncHandler, AppError } from '../middleware';
import { uploadToCloudinary } from '../config/cloudinary';
import { getLayoutSuggestions } from '../services/gemini';
import { renderPosterToBuffer, renderPosterToPDF } from '../services/renderer';
import { AuthRequest } from '../middleware/auth';
import { OCCASION_COLORS } from '../../shared/types';

export const createPoster = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { templateId, formData, uploadedPhotoUrls } = req.body;

  const template = await Template.findById(templateId);
  if (!template) {
    throw new AppError('Template not found', 404);
  }

  if (uploadedPhotoUrls.length > template.layoutConfig.photoSlots.length) {
    throw new AppError(`Maximum ${template.layoutConfig.photoSlots.length} photos allowed`, 400);
  }

  const poster = await Poster.create({
    userId,
    templateId,
    formData,
    uploadedPhotoUrls,
    status: 'generating',
  });

  // Start async generation
  generatePosterAsync(poster._id.toString());

  res.status(202).json({
    success: true,
    data: {
      posterId: poster._id,
      status: 'generating',
      message: 'Poster generation started. Poll for status.',
    },
  });
});

export const getPoster = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const poster = await Poster.findById(id).populate('templateId');
  if (!poster) {
    throw new AppError('Poster not found', 404);
  }

  // Check ownership (unless admin)
  if (poster.userId.toString() !== userId.toString() && req.user!.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  res.json({
    success: true,
    data: poster,
  });
});

export const getUserPosters = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { page = 1, limit = 10 } = req.query;

  const skip = (Number(page) - 1) * Number(limit);
  
  const [posters, total] = await Promise.all([
    Poster.find({ userId })
      .populate('templateId', 'title occasionType thumbnailUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Poster.countDocuments({ userId }),
  ]);

  res.json({
    success: true,
    data: {
      items: posters,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
});

export const regeneratePoster = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const poster = await Poster.findById(id).populate('templateId');
  if (!poster) {
    throw new AppError('Poster not found', 404);
  }

  if (poster.userId.toString() !== userId.toString()) {
    throw new AppError('Not authorized', 403);
  }

  if (!poster.templateId) {
    throw new AppError('This template is no longer available.', 400);
  }

  if (poster.retryCount >= config.generation.maxRetries) {
    throw new AppError(`Maximum ${config.generation.maxRetries} retries exceeded`, 400);
  }

  poster.status = 'generating';
  poster.retryCount += 1;
  await poster.save();

  generatePosterAsync(poster._id.toString());

  res.json({
    success: true,
    data: {
      posterId: poster._id,
      status: 'generating',
      retryCount: poster.retryCount,
    },
  });
});

export const deletePoster = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const userId = req.user!._id;

  const poster = await Poster.findById(id);
  if (!poster) {
    throw new AppError('Poster not found', 404);
  }

  if (poster.userId.toString() !== userId.toString() && req.user!.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  await Poster.findByIdAndDelete(id);

  res.json({
    success: true,
    message: 'Poster deleted successfully',
  });
});

const generatePosterAsync = async (posterId: string) => {
  const startTime = Date.now();
  
  try {
    const poster = await Poster.findById(posterId).populate(['templateId', 'userId']);
    if (!poster) return;

    const template = poster.templateId as any;
    const user = poster.userId as any;
    const occasionColors = OCCASION_COLORS[poster.formData.occasionType as keyof typeof OCCASION_COLORS] || OCCASION_COLORS.campaign;

    // Get Gemini suggestions
    const geminiSuggestions = await getLayoutSuggestions(
      template.layoutConfig,
      poster.formData,
      poster.formData.occasionType
    );

    // Render poster
    const imageBuffer = await renderPosterToBuffer({
      templateLayout: template.layoutConfig,
      formData: poster.formData,
      photoUrls: poster.uploadedPhotoUrls,
      geminiSuggestions,
      occasionColors,
      isPremium: user?.isPremium || false,
    });

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(imageBuffer, 'posters/generated', {
      public_id: `poster_${posterId}`,
    });

    // Update poster
    poster.generatedImageUrl = imageUrl;
    poster.status = 'completed';
    await poster.save();

    // Log generation
    await GenerationLog.create({
      posterId: poster._id,
      geminiPromptUsed: JSON.stringify(geminiSuggestions),
      tokensUsed: 0, // TODO: track actual tokens
      latencyMs: Date.now() - startTime,
      success: true,
    });
  } catch (error) {
    console.error('Generation error:', error);
    
    try {
      await Poster.findByIdAndUpdate(posterId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Generation failed',
      });

      await GenerationLog.create({
        posterId: new mongoose.Types.ObjectId(posterId),
        geminiPromptUsed: 'failed', // required field
        tokensUsed: 0,
        latencyMs: Date.now() - startTime,
        success: false,
      });
    } catch (innerError) {
      console.error('Failed to log generation error:', innerError);
    }
  }
};

export const downloadPoster = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { format = 'png' } = req.query;
  const userId = req.user!._id;

  const poster = await Poster.findById(id).populate('templateId');
  if (!poster) {
    throw new AppError('Poster not found', 404);
  }

  if (poster.userId.toString() !== userId.toString() && req.user!.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  if (poster.status !== 'completed' || !poster.generatedImageUrl) {
    throw new AppError('Poster not ready for download', 400);
  }

  if (format === 'pdf') {
    const template = poster.templateId as any;
    const occasionColors = OCCASION_COLORS[poster.formData.occasionType as keyof typeof OCCASION_COLORS] || OCCASION_COLORS.campaign;
    
    const pdfBuffer = await renderPosterToPDF({
      templateLayout: template.layoutConfig,
      formData: poster.formData,
      photoUrls: poster.uploadedPhotoUrls,
      occasionColors,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="poster_${poster._id}.pdf"`);
    res.send(pdfBuffer);
  } else {
    // Redirect to Cloudinary URL for PNG
    res.redirect(poster.generatedImageUrl);
  }
});

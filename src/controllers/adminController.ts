import { Request, Response } from 'express';
import { Poster, User, GenerationLog, Template } from '../models';
import { asyncHandler } from '../middleware';

export const getModerationQueue = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  // For MVP moderation, we'll just list all posters, newest first
  // In the future, we can add a 'flagged' status or report threshold
  const [posters, total] = await Promise.all([
    Poster.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email'),
    Poster.countDocuments()
  ]);

  res.json({
    success: true,
    data: {
      items: posters,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const deletePoster = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const poster = await Poster.findByIdAndDelete(id);

  if (!poster) {
    res.status(404).json({ success: false, error: 'Poster not found' });
    return;
  }

  res.json({ success: true, message: 'Poster deleted by admin' });
});

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  // Aggregate stats: Total Users, Total Posters, Total Templates
  const [totalUsers, totalPosters, totalTemplates, successfulGenerations] = await Promise.all([
    User.countDocuments(),
    Poster.countDocuments(),
    Template.countDocuments(),
    Poster.countDocuments({ status: 'completed' })
  ]);

  // Aggregate Gemini tokens/latency if logs exist
  const logStats = await GenerationLog.aggregate([
    {
      $group: {
        _id: null,
        totalTokens: { $sum: '$tokensUsed' },
        avgLatency: { $avg: '$latencyMs' },
      }
    }
  ]);

  const tokens = logStats.length > 0 ? logStats[0].totalTokens : 0;
  const avgLatency = logStats.length > 0 ? Math.round(logStats[0].avgLatency) : 0;

  res.json({
    success: true,
    data: {
      totalUsers,
      totalPosters,
      totalTemplates,
      successfulGenerations,
      totalTokens: tokens,
      avgLatencyMs: avgLatency
    },
  });
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.find({}, '-passwordHash').sort({ createdAt: -1 }).limit(100);
  res.json({
    success: true,
    data: users
  });
});

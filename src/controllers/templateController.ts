import { Request, Response } from 'express';
import { Template } from '../models';
import { asyncHandler, AppError } from '../middleware';

export const getTemplates = asyncHandler(async (req: Request, res: Response) => {
  const { occasionType } = req.query;
  
  const filter: any = { isActive: true };
  if (occasionType) {
    filter.occasionType = occasionType;
  }

  const templates = await Template.find(filter).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: templates,
  });
});

export const getTemplateById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const template = await Template.findById(id);
  if (!template) {
    throw new AppError('Template not found', 404);
  }

  res.json({
    success: true,
    data: template,
  });
});

export const createTemplate = asyncHandler(async (req: Request, res: Response) => {
  const template = await Template.create(req.body);

  res.status(201).json({
    success: true,
    data: template,
  });
});

export const updateTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const template = await Template.findByIdAndUpdate(
    id,
    req.body,
    { new: true, runValidators: true }
  );

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  res.json({
    success: true,
    data: template,
  });
});

export const deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const template = await Template.findByIdAndDelete(id);

  if (!template) {
    throw new AppError('Template not found', 404);
  }

  res.json({
    success: true,
    message: 'Template deleted successfully',
  });
});

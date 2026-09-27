import { Request, Response } from 'express';
import multer from 'multer';
import { uploadToCloudinary } from '../config/cloudinary';
import { asyncHandler, AppError } from '../middleware';
import { AuthRequest } from '../middleware/auth';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only JPEG, PNG, and WebP images are allowed', 400));
    }
  },
});

export const uploadMiddleware = upload.array('photos', 3);

export const uploadPhotos = asyncHandler(async (req: AuthRequest, res: Response) => {
  const files = req.files as Express.Multer.File[];
  
  if (!files || files.length === 0) {
    throw new AppError('No files uploaded', 400);
  }

  const uploadedUrls = await Promise.all(
    files.map(file => uploadToCloudinary(file.buffer, 'posters/uploads'))
  );

  res.json({
    success: true,
    data: {
      urls: uploadedUrls,
    },
  });
});

export const uploadSinglePhoto = asyncHandler(async (req: AuthRequest, res: Response) => {
  const file = req.file as Express.Multer.File;
  
  if (!file) {
    throw new AppError('No file uploaded', 400);
  }

  const url = await uploadToCloudinary(file.buffer, 'posters/uploads');

  res.json({
    success: true,
    data: {
      url,
    },
  });
});

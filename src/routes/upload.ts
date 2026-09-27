import { Router } from 'express';
import { uploadMiddleware, uploadPhotos, uploadSinglePhoto } from '../controllers/uploadController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, uploadMiddleware, uploadPhotos);
router.post('/single', authenticate, uploadMiddleware, uploadSinglePhoto);

export default router;

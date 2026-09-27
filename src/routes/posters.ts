import { Router } from 'express';
import { 
  createPoster, 
  getPoster, 
  getUserPosters, 
  regeneratePoster, 
  deletePoster,
  downloadPoster,
  bulkCreatePosters,
  getBulkStatus
} from '../controllers/posterController';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { z } from 'zod';

const router = Router();

const createPosterSchema = z.object({
  body: z.object({
    templateId: z.string(),
    formData: z.object({
      name: z.string().min(1).max(100),
      designation: z.string().min(1).max(200),
      party: z.string().min(1).max(100),
      district: z.string().min(1).max(100),
      upazila: z.string().min(1).max(100),
      union: z.string().min(1).max(100),
      occasionType: z.string(),
      headlineText: z.string().min(1).max(200),
      subHeadline: z.string().max(300).optional(),
    }),
    uploadedPhotoUrls: z.array(z.string().url()).max(3),
  }),
});

router.post('/', authenticate, validate(createPosterSchema), createPoster);
router.post('/bulk', authenticate, bulkCreatePosters);
router.get('/bulk/status', authenticate, getBulkStatus);
router.get('/user', authenticate, getUserPosters);
router.get('/:id', authenticate, getPoster);
router.post('/:id/regenerate', authenticate, regeneratePoster);
router.delete('/:id', authenticate, deletePoster);
router.get('/:id/download', authenticate, downloadPoster);

export default router;

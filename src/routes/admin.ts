import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getModerationQueue, deletePoster, getAnalytics } from '../controllers/adminController';

const router = Router();

// Apply admin protection to all routes in this file
router.use(authenticate, authorize('admin'));

router.get('/posters', getModerationQueue);
router.delete('/posters/:id', deletePoster);
router.get('/analytics', getAnalytics);

export default router;

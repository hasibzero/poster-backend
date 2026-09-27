import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { initPayment, paymentCallback } from '../controllers/paymentController';

const router = Router();

router.post('/init', authenticate, initPayment);
router.get('/callback', paymentCallback);

export default router;

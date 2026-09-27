import { Request, Response } from 'express';
import { User } from '../models';
import { asyncHandler } from '../middleware';

// MOCK BKASH CHECKOUT
export const initPayment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  
  // In a real app, you'd call bKash API here to create a payment URL
  const mockPaymentUrl = `/api/backend/payments/callback?status=success&userId=${userId}`;

  res.json({
    success: true,
    data: {
      paymentUrl: mockPaymentUrl
    }
  });
});

export const paymentCallback = asyncHandler(async (req: Request, res: Response) => {
  const { status, userId } = req.query;

  if (status === 'success' && userId) {
    await User.findByIdAndUpdate(userId, { isPremium: true });
    
    // Redirect to frontend success page
    res.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/dashboard?payment=success`);
    return;
  }

  res.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}/dashboard?payment=failed`);
});

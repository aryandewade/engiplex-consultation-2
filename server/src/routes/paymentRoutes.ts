import { Router } from 'express';
import { createOrder, verifyPayment, handleWebhook } from '../controllers/paymentController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// Order creation and verification require user authentication
router.post('/create-order', authenticate, createOrder);
router.post('/verify', authenticate, verifyPayment);

// Razorpay Webhook (public endpoint called by Razorpay servers)
router.post('/webhook', handleWebhook);

export default router;

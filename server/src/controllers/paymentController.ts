import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyWebhookSignature,
} from '../services/paymentService';
import { verifyAndConfirmBooking } from '../services/bookingService';
import { Booking } from '../models/Booking';
import { ENV } from '../config/env';

export const createOrder = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookingId } = req.body;
    if (!bookingId) {
      res.status(400).json({ success: false, message: 'Booking ID is required.' });
      return;
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    // Server-enforced fixed price: ₹999
    const order = await createRazorpayOrder(booking._id.toString(), 999);
    booking.razorpayOrderId = order.id;
    await booking.save();

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: ENV.RAZORPAY_KEY_ID,
        isSimulator: order.isSimulator,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const userId = req.user!.userId;

    const result = await verifyAndConfirmBooking({
      bookingId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      userId,
    });

    res.json({
      success: true,
      message: 'Payment successfully verified.',
      data: result.booking,
    });
  } catch (error) {
    next(error);
  }
};

export const handleWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = JSON.stringify(req.body);

    if (signature && !verifyWebhookSignature(rawBody, signature)) {
      console.warn('[Webhook] Invalid Razorpay webhook signature.');
      res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
      return;
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`[Webhook Received] Event: ${event}`);

    if (event === 'payment.captured') {
      const paymentEntity = payload.payment?.entity;
      const orderId = paymentEntity?.order_id;
      if (orderId) {
        const booking = await Booking.findOne({ razorpayOrderId: orderId });
        if (booking && booking.status === 'PENDING_PAYMENT') {
          await verifyAndConfirmBooking({
            bookingId: booking._id.toString(),
            razorpayOrderId: orderId,
            razorpayPaymentId: paymentEntity.id,
            razorpaySignature: 'webhook_verified',
            userId: booking.userId.toString(),
          });
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload.payment?.entity;
      const orderId = paymentEntity?.order_id;
      if (orderId) {
        await Booking.updateOne(
          { razorpayOrderId: orderId, status: 'PENDING_PAYMENT' },
          { paymentStatus: 'FAILED' }
        );
      }
    }

    res.json({ status: 'ok' });
  } catch (error) {
    console.error('[Webhook Error]', error);
    res.status(500).json({ status: 'error' });
  }
};

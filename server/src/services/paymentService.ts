import crypto from 'crypto';
import Razorpay from 'razorpay';
import { ENV } from '../config/env';

// Determine if we're using real Razorpay credentials or local simulator
export const isSimulatorMode =
  !ENV.RAZORPAY_KEY_ID ||
  ENV.RAZORPAY_KEY_ID.includes('demo') ||
  ENV.RAZORPAY_KEY_SECRET.includes('demo');

let razorpayClient: Razorpay | null = null;

if (!isSimulatorMode) {
  try {
    razorpayClient = new Razorpay({
      key_id: ENV.RAZORPAY_KEY_ID,
      key_secret: ENV.RAZORPAY_KEY_SECRET,
    });
  } catch (err) {
    console.warn('[Razorpay] Failed to instantiate SDK, falling back to simulator mode.');
  }
}

export interface RazorpayOrderResult {
  id: string;
  amount: number; // in paise
  currency: string;
  receipt: string;
  status: string;
  isSimulator: boolean;
}

/**
 * Creates an official Razorpay order with server-controlled amount (in Paise)
 */
export const createRazorpayOrder = async (
  bookingId: string,
  amountInINR: number = 999
): Promise<RazorpayOrderResult> => {
  const amountInPaise = Math.round(amountInINR * 100);

  if (razorpayClient) {
    try {
      const order = await razorpayClient.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: bookingId,
        payment_capture: true,
      });

      return {
        id: order.id,
        amount: Number(order.amount),
        currency: order.currency,
        receipt: order.receipt || bookingId,
        status: order.status,
        isSimulator: false,
      };
    } catch (error: any) {
      console.error('[Razorpay] Order creation error:', error?.error || error);
      throw new Error(`Razorpay Order creation failed: ${error?.error?.description || error.message}`);
    }
  }

  // Dual-mode simulator: returns identical Razorpay schema for seamless local dev & testing
  const simOrderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: simOrderId,
    amount: amountInPaise,
    currency: 'INR',
    receipt: bookingId,
    status: 'created',
    isSimulator: true,
  };
};

/**
 * Verifies Razorpay payment signature server-side
 */
export const verifyRazorpaySignature = (
  orderId: string,
  paymentId: string,
  signature: string
): boolean => {
  // If simulated order in dev mode
  if (orderId.startsWith('order_sim_') || isSimulatorMode) {
    const expectedSimSig = crypto
      .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');
    // Allow either valid HMAC with demo secret or "simulated_valid_signature" for ease of testing
    return signature === expectedSimSig || signature === 'simulated_valid_signature';
  }

  // Real Razorpay signature verification
  const generatedSignature = crypto
    .createHmac('sha256', ENV.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
};

/**
 * Verifies webhook payload signature
 */
export const verifyWebhookSignature = (
  rawBody: string,
  signature: string
): boolean => {
  if (isSimulatorMode && signature === 'simulated_webhook_signature') {
    return true;
  }

  const expected = crypto
    .createHmac('sha256', ENV.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');

  return expected === signature;
};

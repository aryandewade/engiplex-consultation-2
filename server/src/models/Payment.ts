import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  bookingId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number; // 999
  currency: string; // "INR"
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  status: 'PAID' | 'FAILED' | 'REFUNDED';
  receiptId: string;
  verifiedAt: Date;
  metadata?: Record<string, any>;
}

const PaymentSchema = new Schema<IPayment>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    razorpayOrderId: { type: String, required: true, index: true },
    razorpayPaymentId: { type: String, required: true, index: true },
    razorpaySignature: { type: String, required: true },
    status: { type: String, enum: ['PAID', 'FAILED', 'REFUNDED'], default: 'PAID' },
    receiptId: { type: String, required: true },
    verifiedAt: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);

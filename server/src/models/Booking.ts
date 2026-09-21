import mongoose, { Schema, Document } from 'mongoose';

export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
export type PaymentStatus = 'CREATED' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  consultantId: mongoose.Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "14:00"
  endTime: string;   // "15:00"
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  amount: number; // 999 or 0 if student
  promoCode?: string;
  isStudentOrFresher?: boolean;
  collegeName?: string;
  studentYear?: string;
  stream?: string;
  graduationYear?: number;
  studentIdCardUrl?: string;
  isVerifiedStudent?: boolean;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  receiptId?: string; // "REC-XXXXXXXX"
  meetingLink: string;
  customerNotes?: string;
  expiresAt?: Date; // TTL for PENDING_PAYMENT reservations
  rescheduledFromBookingId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    consultantId: { type: Schema.Types.ObjectId, ref: 'Consultant', required: true, index: true },
    date: { type: String, required: true, index: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING_PAYMENT', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'],
      default: 'PENDING_PAYMENT',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['CREATED', 'PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    amount: { type: Number, required: true, default: 999 },
    promoCode: { type: String },
    isStudentOrFresher: { type: Boolean, default: false },
    collegeName: { type: String },
    studentYear: { type: String },
    stream: { type: String },
    graduationYear: { type: Number },
    studentIdCardUrl: { type: String },
    isVerifiedStudent: { type: Boolean, default: false },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: { type: String },
    receiptId: { type: String, unique: true, sparse: true },
    meetingLink: { type: String, default: '' },
    customerNotes: { type: String, default: '' },
    expiresAt: { type: Date, index: { expireAfterSeconds: 0 } },
    rescheduledFromBookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
  },
  { timestamps: true }
);

// Crucial: Partial unique index preventing double-booking for the same consultant at the same slot
// when status is CONFIRMED or active PENDING_PAYMENT
BookingSchema.index(
  { consultantId: 1, date: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['CONFIRMED', 'PENDING_PAYMENT'] },
    },
  }
);

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);

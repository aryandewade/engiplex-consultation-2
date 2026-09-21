import mongoose, { Schema, Document } from 'mongoose';

export interface IBookingHistory extends Document {
  bookingId: mongoose.Types.ObjectId;
  action: 'CREATED' | 'RESERVED' | 'CONFIRMED' | 'RESCHEDULED' | 'CANCELLED';
  previousDate?: string;
  previousTime?: string;
  newDate?: string;
  newTime?: string;
  reason?: string;
  performedBy: mongoose.Types.ObjectId;
  performedByRole: 'USER' | 'ADMIN';
  createdAt: Date;
}

const BookingHistorySchema = new Schema<IBookingHistory>(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    action: {
      type: String,
      enum: ['CREATED', 'RESERVED', 'CONFIRMED', 'RESCHEDULED', 'CANCELLED'],
      required: true,
    },
    previousDate: { type: String },
    previousTime: { type: String },
    newDate: { type: String },
    newTime: { type: String },
    reason: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    performedByRole: { type: String, enum: ['USER', 'ADMIN'], required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const BookingHistory = mongoose.model<IBookingHistory>('BookingHistory', BookingHistorySchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  consultantId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  bookingId?: mongoose.Types.ObjectId;
  userName: string;
  userEmail?: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  tag?: string;
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    consultantId: { type: Schema.Types.ObjectId, ref: 'Consultant', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    bookingId: { type: Schema.Types.ObjectId, ref: 'Booking' },
    userName: { type: String, required: true },
    userEmail: { type: String, trim: true, lowercase: true },
    userAvatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    tag: { type: String, default: 'Consulting' },
  },
  { timestamps: true }
);

export const Review = mongoose.model<IReview>('Review', ReviewSchema);

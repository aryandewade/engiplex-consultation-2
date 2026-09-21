import mongoose, { Schema, Document } from 'mongoose';

export interface IDataDeletionOtp extends Document {
  email: string;
  name: string;
  otp: string;
  createdAt: Date;
}

const DataDeletionOtpSchema = new Schema<IDataDeletionOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 }, // Auto expires in 10 minutes (600 seconds)
  }
);

export const DataDeletionOtp = mongoose.model<IDataDeletionOtp>('DataDeletionOtp', DataDeletionOtpSchema);

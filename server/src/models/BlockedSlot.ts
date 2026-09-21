import mongoose, { Schema, Document } from 'mongoose';

export interface IBlockedSlot extends Document {
  consultantId: mongoose.Types.ObjectId;
  date: string; // "YYYY-MM-DD"
  startTime?: string; // "14:00"
  endTime?: string;   // "15:00"
  isFullDay: boolean;
  reason: string;
  createdAt: Date;
}

const BlockedSlotSchema = new Schema<IBlockedSlot>(
  {
    consultantId: { type: Schema.Types.ObjectId, ref: 'Consultant', required: true, index: true },
    date: { type: String, required: true, index: true },
    startTime: { type: String },
    endTime: { type: String },
    isFullDay: { type: Boolean, default: false },
    reason: { type: String, default: 'Unavailable' },
  },
  { timestamps: true }
);

BlockedSlotSchema.index({ consultantId: 1, date: 1, startTime: 1 });

export const BlockedSlot = mongoose.model<IBlockedSlot>('BlockedSlot', BlockedSlotSchema);

import mongoose, { Schema, Document } from 'mongoose';

export interface IConsultant extends Document {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  domain: string;
  bio: string;
  skills: string[];
  expertise?: string[];
  technicalSkills?: string[];
  rating: number;
  reviewCount: number;
  fee: number; // in INR, e.g. 999
  slotDuration: number; // in minutes, e.g. 60
  minNoticeHours: number; // default 24
  workingDays: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday. Default [1,2,3,4,5]
  workingHours: {
    start: string; // "09:00"
    end: string;   // "18:00"
  };
  meetingLink?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ConsultantSchema = new Schema<IConsultant>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    avatar: { type: String, required: true },
    domain: { type: String, required: true, index: true },
    bio: { type: String, required: true },
    skills: [{ type: String, trim: true }],
    expertise: [{ type: String, trim: true }],
    technicalSkills: [{ type: String, trim: true }],
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0 },
    fee: { type: Number, default: 999, required: true },
    slotDuration: { type: Number, default: 60 },
    minNoticeHours: { type: Number, default: 24 },
    workingDays: { type: [Number], default: [1, 2, 3, 4, 5] },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '18:00' },
    },
    meetingLink: { type: String, default: 'https://meet.google.com/ioy-bouu-eih' },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export const Consultant = mongoose.model<IConsultant>('Consultant', ConsultantSchema);

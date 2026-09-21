export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN' | 'CONSULTANT';
  consultantId?: string;
  avatar?: string;
}

export interface Consultant {
  _id: string;
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
  fee: number;
  slotDuration: number;
  minNoticeHours: number;
  workingDays: number[];
  workingHours: {
    start: string;
    end: string;
  };
  isActive: boolean;
  reviews?: Review[];
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  status: 'Available' | 'Booked' | 'Unavailable';
  reason?: string;
}

export interface DayAvailability {
  date: string;
  dayOfWeek: number;
  status: 'available' | 'fully_booked' | 'unavailable' | 'past';
  slotsAvailableCount: number;
  totalSlotsCount: number;
}

export interface Booking {
  _id: string;
  userId: User | string;
  consultantId: Consultant;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  paymentStatus: 'CREATED' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  amount: number;
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
  receiptId?: string;
  meetingLink: string;
  customerNotes?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  consultantId: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  tag?: string;
  createdAt: string;
}

export interface EmailRecord {
  id: string;
  to: string;
  subject: string;
  sentAt: string;
  html: string;
  receiptId?: string;
}

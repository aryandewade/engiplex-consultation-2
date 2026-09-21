import mongoose from 'mongoose';
import { Booking, IBooking } from '../models/Booking';
import { Consultant } from '../models/Consultant';
import { User } from '../models/User';
import { BlockedSlot } from '../models/BlockedSlot';
import { Payment } from '../models/Payment';
import { BookingHistory } from '../models/BookingHistory';
import { calculateEndTime } from './slotService';
import { createRazorpayOrder, verifyRazorpaySignature } from './paymentService';
import {
  sendEmail,
  buildBookingConfirmationEmail,
  buildRescheduleEmail,
  buildCancellationEmail,
} from './emailService';
import { ENV } from '../config/env';

export interface ReserveSlotInput {
  userId: string;
  consultantId: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // e.g. "19:00"
  customerNotes?: string;
  promoCode?: string;
  isStudentOrFresher?: boolean;
  collegeName?: string;
  studentYear?: string;
  stream?: string;
  graduationYear?: number;
  studentIdCardUrl?: string;
  now?: Date;
}

export interface ConfirmPaymentInput {
  bookingId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId: string;
}

export const reserveBookingSlot = async (input: ReserveSlotInput) => {
  const now = input.now || new Date();
  const {
    userId,
    consultantId,
    date,
    startTime,
    customerNotes,
    promoCode,
    isStudentOrFresher,
    collegeName,
    studentYear,
    stream,
    graduationYear,
    studentIdCardUrl,
  } = input;

  // 1. Verify User
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found.');

  // 2. Verify Consultant
  const consultant = await Consultant.findById(consultantId);
  if (!consultant || !consultant.isActive) {
    throw new Error('This consultant is inactive or unavailable.');
  }

  // 3. Compute slot end time (20 minutes duration for evening session)
  const endTime = calculateEndTime(startTime, 20);

  // 4. Validate not in past
  const [year, month, day] = date.split('-').map(Number);
  const [slotH, slotM] = startTime.split(':').map(Number);
  const slotStartDateTime = new Date(year, month - 1, day, slotH, slotM, 0);

  if (slotStartDateTime.getTime() <= now.getTime()) {
    throw new Error('Cannot book an appointment in the past.');
  }

  // 5. Validate Blocked Slots & Holidays
  const blocked = await BlockedSlot.findOne({
    consultantId,
    date,
    $or: [{ isFullDay: true }, { startTime }],
  });

  if (blocked) {
    throw new Error(
      `This slot is unavailable: ${blocked.reason || 'Blocked by administrator'}. Please select another time.`
    );
  }

  // 6. Prevent Double-Booking / Race conditions
  const existingActiveBooking = await Booking.findOne({
    consultantId,
    date,
    startTime,
    $or: [
      { status: 'CONFIRMED' },
      { status: 'PENDING_PAYMENT', expiresAt: { $gt: now } },
    ],
  });

  if (existingActiveBooking) {
    if (
      existingActiveBooking.userId.toString() === userId &&
      existingActiveBooking.status === 'PENDING_PAYMENT'
    ) {
      // Re-use pending reservation
      const order = await createRazorpayOrder(
        existingActiveBooking._id.toString(),
        consultant.fee || 999
      );
      existingActiveBooking.razorpayOrderId = order.id;
      existingActiveBooking.expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
      await existingActiveBooking.save();

      return {
        booking: existingActiveBooking,
        razorpayOrder: order,
        razorpayKeyId: ENV.RAZORPAY_KEY_ID,
        isFreeStudentBooking: false,
      };
    }

    throw new Error('This slot was just selected by someone else. Please choose another time.');
  }

  // Clean up any stale expired pending reservations
  await Booking.deleteMany({
    consultantId,
    date,
    startTime,
    status: 'PENDING_PAYMENT',
    expiresAt: { $lte: now },
  });

  // 7. Check if student promo code "Engistud" is applied
  const isStudentCode = promoCode && promoCode.trim().toLowerCase() === 'engistud';

  if (isStudentCode) {
    // Validate student details
    if (!graduationYear || Number(graduationYear) < 2024) {
      throw new Error(
        'Please select a valid graduation year (2024 onwards) to claim student/fresher consultation.'
      );
    }

    // Free student booking
    const receiptId = `REC-STU-${Date.now().toString(36).toUpperCase()}${Math.random()
      .toString(36)
      .substring(2, 5)
      .toUpperCase()}`;

    const newBooking = new Booking({
      userId,
      consultantId,
      date,
      startTime,
      endTime,
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      amount: 0,
      promoCode: 'Engistud',
      isStudentOrFresher: true,
      collegeName: collegeName || 'Student Verified',
      studentYear: studentYear || 'Current Student',
      stream: stream || 'Engineering',
      graduationYear: Number(graduationYear),
      studentIdCardUrl: studentIdCardUrl || 'Verified Student',
      isVerifiedStudent: true,
      receiptId,
      customerNotes: customerNotes || '',
      meetingLink: `https://meet.jit.si/consultflow-${Math.random().toString(36).substring(2, 10)}`,
    });

    await newBooking.save();

    // Audit trail
    await BookingHistory.create({
      bookingId: newBooking._id,
      action: 'CONFIRMED',
      newDate: date,
      newTime: startTime,
      reason: 'Free Student / Fresher consultation verified with promo Engistud',
      performedBy: userId,
      performedByRole: user.role,
    });

    // Send confirmation email
    if (user.email) {
      const emailHtml = buildBookingConfirmationEmail({
        customerName: user.name,
        consultantName: consultant.name,
        date: newBooking.date,
        startTime: newBooking.startTime,
        endTime: newBooking.endTime,
        amount: 0,
        receiptId,
        bookingId: newBooking._id.toString(),
        meetingLink: newBooking.meetingLink,
      });

      sendEmail({
        to: user.email,
        subject: `Your Free Student Consultation with ${consultant.name} is Confirmed!`,
        html: emailHtml,
        receiptId,
      }).catch((e) => console.error('[Email] Failed free confirmation:', e));
    }

    return {
      booking: newBooking,
      isFreeStudentBooking: true,
      receiptId,
    };
  }

  // 8. Standard ₹999 Booking via Razorpay
  const fixedFee = 999;
  const holdMinutes = 10;
  const expiresAt = new Date(now.getTime() + holdMinutes * 60 * 1000);

  const newBooking = new Booking({
    userId,
    consultantId,
    date,
    startTime,
    endTime,
    status: 'PENDING_PAYMENT',
    paymentStatus: 'PENDING',
    amount: fixedFee,
    customerNotes: customerNotes || '',
    expiresAt,
    meetingLink: `https://meet.jit.si/consultflow-${Math.random().toString(36).substring(2, 10)}`,
  });

  await newBooking.save();

  const razorpayOrder = await createRazorpayOrder(newBooking._id.toString(), fixedFee);
  newBooking.razorpayOrderId = razorpayOrder.id;
  await newBooking.save();

  await BookingHistory.create({
    bookingId: newBooking._id,
    action: 'RESERVED',
    newDate: date,
    newTime: startTime,
    performedBy: userId,
    performedByRole: user.role,
  });

  return {
    booking: newBooking,
    razorpayOrder,
    razorpayKeyId: ENV.RAZORPAY_KEY_ID,
    isFreeStudentBooking: false,
  };
};

export const verifyAndConfirmBooking = async (input: ConfirmPaymentInput) => {
  const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature, userId } = input;

  // 1. Fetch booking
  const booking = await Booking.findById(bookingId).populate<{
    consultantId: any;
    userId: any;
  }>(['consultantId', 'userId']);

  if (!booking) {
    throw new Error('Booking record not found.');
  }

  if (booking.status === 'CONFIRMED' && booking.paymentStatus === 'PAID') {
    return { booking, alreadyConfirmed: true };
  }

  // 2. Validate Payment Signature
  const isValid = verifyRazorpaySignature(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  if (!isValid) {
    booking.paymentStatus = 'FAILED';
    await booking.save();
    throw new Error('Payment verification failed: Invalid digital signature.');
  }

  // 3. Generate Official Verifiable Receipt ID: REC-XXXXXXXX
  const receiptId = `REC-${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .substring(2, 5)
    .toUpperCase()}`;

  // 4. Update Booking to CONFIRMED
  booking.status = 'CONFIRMED';
  booking.paymentStatus = 'PAID';
  booking.razorpayPaymentId = razorpayPaymentId;
  booking.razorpaySignature = razorpaySignature;
  booking.receiptId = receiptId;
  booking.expiresAt = undefined; // clear TTL hold
  await booking.save();

  // 5. Store Payment Record
  await Payment.create({
    bookingId: booking._id,
    userId: booking.userId._id || userId,
    amount: booking.amount,
    currency: 'INR',
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    status: 'PAID',
    receiptId,
  });

  // 6. Record in Audit History
  await BookingHistory.create({
    bookingId: booking._id,
    action: 'CONFIRMED',
    newDate: booking.date,
    newTime: booking.startTime,
    performedBy: userId,
    performedByRole: 'USER',
  });

  // 7. Dispatch Email Receipt to Client
  const customer = booking.userId;
  const consultant = booking.consultantId;

  if (customer && customer.email) {
    const emailHtml = buildBookingConfirmationEmail({
      customerName: customer.name,
      consultantName: consultant.name,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      amount: booking.amount,
      receiptId,
      bookingId: booking._id.toString(),
      meetingLink: booking.meetingLink,
    });

    sendEmail({
      to: customer.email,
      subject: `Your consultation with ${consultant.name} is confirmed`,
      html: emailHtml,
      receiptId,
    }).catch((err) => console.error('[Email] Failed customer confirmation email:', err));
  }

  // Also dispatch notification to consultant
  if (consultant && consultant.email) {
    sendEmail({
      to: consultant.email,
      subject: `New Booking Confirmed: ${customer.name} on ${booking.date} at ${booking.startTime}`,
      html: `<p>A new consultation has been booked and paid for by ${customer.name} (${customer.email}) for ${booking.date} from ${booking.startTime} to ${booking.endTime}. Meeting link: <a href="${booking.meetingLink}">${booking.meetingLink}</a></p>`,
    }).catch((err) => console.error('[Email] Failed consultant notification:', err));
  }

  return { booking, alreadyConfirmed: false };
};

export const rescheduleBooking = async (
  bookingId: string,
  newDate: string,
  newStartTime: string,
  userId: string,
  userRole: 'USER' | 'ADMIN',
  reason?: string
) => {
  const now = new Date();
  const booking = await Booking.findById(bookingId).populate<{
    consultantId: any;
    userId: any;
  }>(['consultantId', 'userId']);

  if (!booking) throw new Error('Booking not found.');

  // Access check: Only owner or admin can reschedule
  if (userRole !== 'ADMIN' && booking.userId._id.toString() !== userId) {
    throw new Error('You do not have permission to reschedule this booking.');
  }

  if (booking.status !== 'CONFIRMED') {
    throw new Error(`Cannot reschedule booking in status: ${booking.status}.`);
  }

  // Enforce reschedule notice: minimum 12 hours before original appointment
  const [oY, oM, oD] = booking.date.split('-').map(Number);
  const [oH, oMin] = booking.startTime.split(':').map(Number);
  const originalSlotDate = new Date(oY, oM - 1, oD, oH, oMin, 0);

  if (userRole !== 'ADMIN') {
    const hoursRemaining = (originalSlotDate.getTime() - now.getTime()) / (3600 * 1000);
    if (hoursRemaining < 12) {
      throw new Error(
        'Rescheduling is only permitted at least 12 hours prior to the appointment.'
      );
    }
  }

  const consultant = booking.consultantId;
  const newEndTime = calculateEndTime(newStartTime, consultant.slotDuration || 60);

  // Validate new slot satisfies 24-hour advance notice
  const [nY, nM, nD] = newDate.split('-').map(Number);
  const [nH, nMin] = newStartTime.split(':').map(Number);
  const newSlotDate = new Date(nY, nM - 1, nD, nH, nMin, 0);

  if (newSlotDate.getTime() <= now.getTime()) {
    throw new Error('New appointment date and time must be in the future.');
  }

  const minNoticeMs = (consultant.minNoticeHours || 24) * 3600 * 1000;
  if (newSlotDate.getTime() - now.getTime() < minNoticeMs) {
    throw new Error(
      `Appointments must be scheduled at least ${consultant.minNoticeHours} hours in advance.`
    );
  }

  // Check working days & hours
  const newDayOfWeek = newSlotDate.getDay();
  if (!consultant.workingDays.includes(newDayOfWeek)) {
    throw new Error('Consultant is not available on this day of the week.');
  }

  if (
    newStartTime < consultant.workingHours.start ||
    newEndTime > consultant.workingHours.end
  ) {
    throw new Error('Selected slot is outside consultant’s working hours.');
  }

  // Check blocked slot
  const isBlocked = await BlockedSlot.findOne({
    consultantId: consultant._id,
    date: newDate,
    $or: [{ isFullDay: true }, { startTime: newStartTime }],
  });

  if (isBlocked) {
    throw new Error(
      `This slot is blocked (${isBlocked.reason || 'Unavailable'}). Please pick another time.`
    );
  }

  // Check if new slot is already booked by someone else
  const conflict = await Booking.findOne({
    _id: { $ne: booking._id },
    consultantId: consultant._id,
    date: newDate,
    startTime: newStartTime,
    $or: [
      { status: 'CONFIRMED' },
      { status: 'PENDING_PAYMENT', expiresAt: { $gt: now } },
    ],
  });

  if (conflict) {
    throw new Error('The chosen new slot has already been booked. Please pick another slot.');
  }

  const prevDate = booking.date;
  const prevTime = booking.startTime;

  booking.date = newDate;
  booking.startTime = newStartTime;
  booking.endTime = newEndTime;
  await booking.save();

  // Audit history
  await BookingHistory.create({
    bookingId: booking._id,
    action: 'RESCHEDULED',
    previousDate: prevDate,
    previousTime: prevTime,
    newDate,
    newTime: newStartTime,
    reason: reason || 'Rescheduled by user/admin',
    performedBy: userId,
    performedByRole: userRole,
  });

  // Dispatch reschedule email
  if (booking.userId?.email) {
    const html = buildRescheduleEmail({
      customerName: booking.userId.name,
      consultantName: consultant.name,
      previousDate: prevDate,
      previousTime: prevTime,
      newDate,
      newTime: newStartTime,
      meetingLink: booking.meetingLink,
    });

    sendEmail({
      to: booking.userId.email,
      subject: `Your consultation with ${consultant.name} has been rescheduled`,
      html,
    }).catch((e) => console.error('[Email] Failed reschedule customer email:', e));
  }

  return booking;
};

export const cancelBooking = async (
  bookingId: string,
  userId: string,
  userRole: 'USER' | 'ADMIN',
  reason?: string
) => {
  const now = new Date();
  const booking = await Booking.findById(bookingId).populate<{
    consultantId: any;
    userId: any;
  }>(['consultantId', 'userId']);

  if (!booking) throw new Error('Booking not found.');

  // Access check
  if (userRole !== 'ADMIN' && booking.userId._id.toString() !== userId) {
    throw new Error('You do not have permission to cancel this booking.');
  }

  if (booking.status === 'CANCELLED') {
    return booking;
  }

  // Cancellation notice check: minimum 12 hours before appointment (unless admin)
  const [oY, oM, oD] = booking.date.split('-').map(Number);
  const [oH, oMin] = booking.startTime.split(':').map(Number);
  const slotDate = new Date(oY, oM - 1, oD, oH, oMin, 0);

  if (userRole !== 'ADMIN') {
    const hoursRemaining = (slotDate.getTime() - now.getTime()) / (3600 * 1000);
    if (hoursRemaining < 12) {
      throw new Error(
        'Cancellations are only permitted at least 12 hours prior to the appointment.'
      );
    }
  }

  booking.status = 'CANCELLED';
  if (booking.paymentStatus === 'PAID') {
    booking.paymentStatus = 'REFUNDED';
  }
  await booking.save();

  // Audit history
  await BookingHistory.create({
    bookingId: booking._id,
    action: 'CANCELLED',
    previousDate: booking.date,
    previousTime: booking.startTime,
    reason: reason || 'Cancelled by user/admin',
    performedBy: userId,
    performedByRole: userRole,
  });

  // Dispatch cancellation email
  if (booking.userId?.email) {
    const html = buildCancellationEmail({
      customerName: booking.userId.name,
      consultantName: booking.consultantId?.name || 'Mentor',
      date: booking.date,
      time: booking.startTime,
      reason,
      refundStatus: booking.paymentStatus === 'REFUNDED' ? 'Refund Approved' : 'N/A',
    });

    sendEmail({
      to: booking.userId.email,
      subject: `Consultation Cancelled: ${booking.date} at ${booking.startTime}`,
      html,
    }).catch((e) => console.error('[Email] Failed cancel email:', e));
  }

  return booking;
};

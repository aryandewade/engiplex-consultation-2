import { Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  reserveBookingSlot,
  verifyAndConfirmBooking,
  rescheduleBooking,
  cancelBooking,
  inMemoryBookingsMap,
  inMemoryUsersMap,
  DEFAULT_ASHISH_CONSULTANT,
} from '../services/bookingService';
import { Booking } from '../models/Booking';
import { User } from '../models/User';
import { signToken } from '../utils/jwt';
import mongoose from 'mongoose';

const reserveSchema = z.object({
  consultantId: z.string().min(1, 'Consultant ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:mm format'),
  customerNotes: z.string().optional(),
  clientName: z.string().optional(),
  clientEmail: z.string().email('Please enter a valid email address').optional(),
  clientPhone: z.string().optional(),
  promoCode: z.string().optional(),
  isStudentOrFresher: z.boolean().optional(),
  collegeName: z.string().optional(),
  studentYear: z.string().optional(),
  stream: z.string().optional(),
  graduationYear: z.union([z.number(), z.string().transform((v) => parseInt(v, 10))]).optional(),
  studentIdCardUrl: z.string().optional(),
});

const confirmSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  razorpayOrderId: z.string().min(1, 'Razorpay Order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay Payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay Signature is required'),
});

const rescheduleSchema = z.object({
  newDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'New date must be in YYYY-MM-DD format'),
  newStartTime: z.string().regex(/^\d{2}:\d{2}$/, 'New start time must be in HH:mm format'),
  reason: z.string().optional(),
});

export const reserve = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = reserveSchema.parse(req.body);
    let userId: string = req.user?.userId || '';
    let userToken: string | undefined;
    let userData: any;

    if (!userId) {
      if (!body.clientEmail || !body.clientName) {
        res.status(400).json({
          success: false,
          message: 'Please provide your name and email address for confirmation.',
        });
        return;
      }

      const email = body.clientEmail.toLowerCase().trim();
      const isDbConnected = mongoose.connection.readyState === 1;

      let user: any = null;
      if (isDbConnected) {
        try {
          user = await Promise.race([
            User.findOne({ email }),
            new Promise<null>((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 2500)),
          ]);
          if (!user) {
            user = await User.create({
              name: body.clientName.trim(),
              email,
              phone: body.clientPhone?.trim() || '9999999999',
              passwordHash: await bcrypt.hash(Math.random().toString(36), 10),
              role: 'USER',
            });
          } else if (body.clientName && (!user.name || user.name === 'Client')) {
            user.name = body.clientName.trim();
            await user.save();
          }
        } catch (dbErr) {
          console.warn('[Booking] MongoDB user operation deferred:', dbErr);
        }
      }

      if (!user) {
        const fallbackUserId = new mongoose.Types.ObjectId().toString();
        user = {
          _id: fallbackUserId,
          name: body.clientName.trim(),
          email,
          phone: body.clientPhone?.trim() || '9999999999',
          role: 'USER',
        };
        inMemoryUsersMap.set(fallbackUserId, user);
      }

      userId = user._id.toString();
      userToken = signToken({
        userId,
        role: user.role,
        email: user.email,
      });
      userData = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      };
    }

    const result = await reserveBookingSlot({
      userId,
      consultantId: body.consultantId,
      date: body.date,
      startTime: body.startTime,
      customerNotes: body.customerNotes,
      promoCode: body.promoCode,
      isStudentOrFresher: body.isStudentOrFresher,
      collegeName: body.collegeName,
      studentYear: body.studentYear,
      stream: body.stream,
      graduationYear: body.graduationYear,
      studentIdCardUrl: body.studentIdCardUrl,
    });

    res.status(201).json({
      success: true,
      message: (result as any).isFreeStudentBooking
        ? 'Student / Fresher status verified! Your Pay What You Can session is confirmed.'
        : 'Slot temporarily reserved. Please complete payment to confirm.',
      data: {
        ...result,
        token: userToken,
        user: userData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const confirm = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = confirmSchema.parse(req.body);
    let userId: string = req.user?.userId || '';

    if (!userId) {
      let bookingDoc: any = null;
      if (mongoose.connection.readyState === 1) {
        try {
          bookingDoc = await Booking.findById(body.bookingId);
        } catch (e) { }
      }
      if (!bookingDoc) {
        bookingDoc = inMemoryBookingsMap.get(body.bookingId);
      }
      if (!bookingDoc) {
        res.status(404).json({ success: false, message: 'Booking not found.' });
        return;
      }
      userId = (bookingDoc.userId?._id || bookingDoc.userId || 'usr_guest').toString();
    }

    const result = await verifyAndConfirmBooking({
      bookingId: body.bookingId,
      razorpayOrderId: body.razorpayOrderId,
      razorpayPaymentId: body.razorpayPaymentId,
      razorpaySignature: body.razorpaySignature,
      userId,
    });

    res.json({
      success: true,
      message: 'Payment verified and appointment officially confirmed!',
      data: result.booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    let booking: any = null;
    if (mongoose.connection.readyState === 1) {
      try {
        booking = await Booking.findById(id).populate('consultantId userId');
      } catch (e) { }
    }

    if (!booking) {
      booking = inMemoryBookingsMap.get(id);
    }

    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking not found.' });
      return;
    }

    res.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserBookings = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const bookings = await Booking.find({
      userId,
      status: { $in: ['CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'] },
    })
      .populate('consultantId', 'name domain avatar fee email phone')
      .sort({ date: -1, startTime: -1 });

    const todayStr = new Date().toISOString().split('T')[0];

    const upcoming = bookings.filter((b) => b.status === 'CONFIRMED' && b.date >= todayStr);
    const past = bookings.filter((b) => b.date < todayStr || b.status !== 'CONFIRMED');

    res.json({
      success: true,
      data: {
        upcoming,
        past,
        total: bookings.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const reschedule = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const body = rescheduleSchema.parse(req.body);

    const updated = await rescheduleBooking(
      id,
      body.newDate,
      body.newStartTime,
      userId,
      userRole,
      body.reason
    );

    res.json({
      success: true,
      message: 'Consultation successfully rescheduled.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const cancel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const userRole = req.user!.role;
    const { reason } = req.body;

    const updated = await cancelBooking(id, userId, userRole, reason);

    res.json({
      success: true,
      message: 'Consultation successfully cancelled.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

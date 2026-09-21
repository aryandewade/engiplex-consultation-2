import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Booking } from '../models/Booking';
import { Consultant } from '../models/Consultant';
import { User } from '../models/User';
import { BookingHistory } from '../models/BookingHistory';

/**
 * Helper to resolve the consultant document for the authenticated user
 */
const resolveConsultantForUser = async (req: AuthenticatedRequest) => {
  if (!req.user) return null;

  // 1. Direct consultantId on user/token
  if (req.user.consultantId) {
    const consultant = await Consultant.findById(req.user.consultantId);
    if (consultant) return consultant;
  }

  // 2. Check User record in DB
  const user = await User.findById(req.user.userId);
  if (user?.consultantId) {
    const consultant = await Consultant.findById(user.consultantId);
    if (consultant) return consultant;
  }

  // 3. Fallback: match by email
  if (req.user.email) {
    const consultant = await Consultant.findOne({ email: req.user.email.toLowerCase().trim() });
    if (consultant) return consultant;
  }

  return null;
};

export const getMyBookings = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const consultant = await resolveConsultantForUser(req);
    if (!consultant) {
      res.status(404).json({
        success: false,
        message: 'No consultant mentor profile is linked to this account.',
      });
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const bookings = await Booking.find({
      consultantId: consultant._id,
      status: { $in: ['CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'] },
    })
      .populate('userId', 'name email phone avatar')
      .sort({ date: 1, startTime: 1 });

    // Segregate bookings
    const today = bookings.filter((b) => b.date === todayStr && b.status === 'CONFIRMED');
    const upcoming = bookings.filter((b) => b.date > todayStr && b.status === 'CONFIRMED');
    const completed = bookings.filter((b) => b.status === 'COMPLETED');
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED');

    // Calculate consultant metrics
    const confirmedAndCompleted = bookings.filter((b) =>
      ['CONFIRMED', 'COMPLETED'].includes(b.status)
    );
    const totalEarnings = confirmedAndCompleted.reduce((sum, b) => sum + (b.amount || 0), 0);
    const studentSessions = confirmedAndCompleted.filter(
      (b) => b.isStudentOrFresher || b.amount === 0
    ).length;

    res.json({
      success: true,
      data: {
        consultant: {
          id: consultant._id,
          name: consultant.name,
          email: consultant.email,
          phone: consultant.phone,
          avatar: consultant.avatar,
          domain: consultant.domain,
          bio: consultant.bio,
          skills: consultant.skills,
          rating: consultant.rating,
          reviewCount: consultant.reviewCount,
          fee: consultant.fee,
          workingHours: consultant.workingHours,
        },
        stats: {
          totalBookings: confirmedAndCompleted.length,
          todayCount: today.length,
          upcomingCount: upcoming.length,
          completedCount: completed.length,
          cancelledCount: cancelled.length,
          studentSessions,
          totalEarnings,
        },
        bookings: {
          today,
          upcoming,
          completed,
          cancelled,
          all: [...bookings].reverse(),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const completeBooking = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const consultant = await resolveConsultantForUser(req);

    if (!consultant) {
      res.status(404).json({
        success: false,
        message: 'No consultant mentor profile is linked to this account.',
      });
      return;
    }

    const booking = await Booking.findById(id).populate('userId', 'name email phone avatar');
    if (!booking) {
      res.status(404).json({ success: false, message: 'Booking appointment not found.' });
      return;
    }

    if (booking.consultantId.toString() !== consultant._id.toString() && req.user?.role !== 'ADMIN') {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to manage this booking.',
      });
      return;
    }

    booking.status = 'COMPLETED';
    await booking.save();

    await BookingHistory.create({
      bookingId: booking._id,
      action: 'COMPLETED',
      performedBy: req.user?.userId,
      performedByRole: req.user?.role,
      reason: `Consultation marked completed by mentor ${consultant.name}`,
    });

    res.json({
      success: true,
      message: 'Consultation appointment marked as completed successfully!',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

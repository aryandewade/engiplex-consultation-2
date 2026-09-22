import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Booking } from '../models/Booking';
import { Consultant } from '../models/Consultant';
import { BlockedSlot } from '../models/BlockedSlot';
import { User } from '../models/User';
import { rescheduleBooking, cancelBooking } from '../services/bookingService';
import { generateDefaultSlots } from '../services/slotService';
import { sentEmailsLog } from '../services/emailService';

export const getDashboardStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];

    const [totalBookings, todayBookings, paidBookings, activeConsultants] = await Promise.all([
      Booking.countDocuments({ status: { $in: ['CONFIRMED', 'COMPLETED'] } }),
      Booking.countDocuments({ date: todayStr, status: 'CONFIRMED' }),
      Booking.find({ paymentStatus: 'PAID' }).select('amount'),
      Consultant.countDocuments({ isActive: true }),
    ]);

    const totalRevenue = paidBookings.reduce((sum, b) => sum + (b.amount || 999), 0);

    const recentBookings = await Booking.find({ status: 'CONFIRMED' })
      .populate('consultantId', 'name domain avatar')
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalBookings,
        todayBookings,
        totalRevenue,
        activeConsultants,
        recentBookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTodaySchedule = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const consultantId = req.query.consultantId as string;

    const consultantQuery: any = { isActive: true };
    if (consultantId) consultantQuery._id = consultantId;

    const consultants = await Consultant.find(consultantQuery);

    // Fetch all bookings and blocked slots for this date
    const [bookings, blockedSlots] = await Promise.all([
      Booking.find({
        date: dateStr,
        status: { $in: ['CONFIRMED', 'COMPLETED', 'PENDING_PAYMENT'] },
        ...(consultantId ? { consultantId } : {}),
      })
        .populate('userId', 'name email phone')
        .populate('consultantId', 'name domain avatar'),
      BlockedSlot.find({
        date: dateStr,
        ...(consultantId ? { consultantId } : {}),
      }),
    ]);

    // Build timeline grouped by consultant
    const scheduleByConsultant = consultants.map((c) => {
      const baseSlots = generateDefaultSlots();
      const cBookings = bookings.filter((b) => b.consultantId?._id?.toString() === c._id.toString());
      const cBlocks = blockedSlots.filter((b) => b.consultantId.toString() === c._id.toString());
      const isFullDayBlocked = cBlocks.some((b) => b.isFullDay);

      const slots = baseSlots.map(({ startTime, endTime }) => {
        const booking = cBookings.find((b) => b.startTime === startTime);
        const block = cBlocks.find((b) => b.startTime === startTime);

        if (booking) {
          const userObj = booking.userId as any;
          return {
            startTime,
            endTime,
            status: 'Booked',
            booking: {
              id: booking._id,
              customerName: userObj?.name || 'Customer',
              customerEmail: userObj?.email || '',
              customerPhone: userObj?.phone || '',
              paymentStatus: booking.paymentStatus,
              status: booking.status,
              receiptId: booking.receiptId,
              meetingLink: booking.meetingLink,
            },
          };
        }

        if (isFullDayBlocked || block) {
          return {
            startTime,
            endTime,
            status: 'Unavailable',
            reason: block?.reason || (isFullDayBlocked ? 'Full Day Blocked / Holiday' : 'Unavailable'),
            blockId: block?._id,
          };
        }

        return {
          startTime,
          endTime,
          status: 'Available',
        };
      });

      return {
        consultant: {
          id: c._id,
          name: c.name,
          domain: c.domain,
          avatar: c.avatar,
        },
        slots,
      };
    });

    res.json({
      success: true,
      date: dateStr,
      schedule: scheduleByConsultant,
    });
  } catch (error) {
    next(error);
  }
};

export const blockSlot = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { consultantId, date, startTime, isFullDay, reason } = req.body;

    if (!consultantId || !date) {
      res.status(400).json({ success: false, message: 'Consultant ID and Date are required.' });
      return;
    }

    // CRITICAL SAFETY CHECK: Does this slot or day have any confirmed bookings?
    const bookingQuery: any = {
      consultantId,
      date,
      status: 'CONFIRMED',
    };

    if (!isFullDay && startTime) {
      bookingQuery.startTime = startTime;
    }

    const existingBookings = await Booking.find(bookingQuery).populate('userId', 'name email phone');

    if (existingBookings.length > 0) {
      // Conflict Guard: Do NOT silently delete or block! Alert the admin!
      res.status(409).json({
        success: false,
        hasConflict: true,
        message: 'This slot already has an active customer booking. Please reschedule or cancel the booking first.',
        conflictBookings: existingBookings.map((b) => {
          const u = b.userId as any;
          return {
            id: b._id,
            customerName: u?.name,
            customerEmail: u?.email,
            customerPhone: u?.phone,
            startTime: b.startTime,
            endTime: b.endTime,
            date: b.date,
          };
        }),
      });
      return;
    }

    const blocked = await BlockedSlot.create({
      consultantId,
      date,
      startTime: isFullDay ? undefined : startTime,
      endTime: isFullDay ? undefined : startTime ? `${parseInt(startTime.split(':')[0]) + 1}:00` : undefined,
      isFullDay: Boolean(isFullDay),
      reason: reason || 'Marked unavailable by administrator',
    });

    res.status(201).json({
      success: true,
      message: 'Slot successfully marked as unavailable.',
      data: blocked,
    });
  } catch (error) {
    next(error);
  }
};

export const unblockSlot = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    await BlockedSlot.findByIdAndDelete(id);
    res.json({ success: true, message: 'Slot unblocked and marked available.' });
  } catch (error) {
    next(error);
  }
};

export const getAllBookings = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, consultantId, date, search } = req.query;

    const query: any = {};
    if (status) query.status = status;
    if (consultantId) query.consultantId = consultantId;
    if (date) query.date = date;

    let bookings = await Booking.find(query)
      .populate('consultantId', 'name domain avatar fee')
      .populate('userId', 'name email phone')
      .sort({ date: -1, startTime: -1 });

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.toLowerCase().trim();
      bookings = bookings.filter((b) => {
        const u = b.userId as any;
        const c = b.consultantId as any;
        return (
          u?.name?.toLowerCase().includes(q) ||
          u?.email?.toLowerCase().includes(q) ||
          c?.name?.toLowerCase().includes(q) ||
          b.receiptId?.toLowerCase().includes(q)
        );
      });
    }

    res.json({
      success: true,
      data: bookings,
      total: bookings.length,
    });
  } catch (error) {
    next(error);
  }
};

export const adminReschedule = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { newDate, newStartTime, reason } = req.body;
    const adminId = req.user!.userId;

    const updated = await rescheduleBooking(
      id,
      newDate,
      newStartTime,
      adminId,
      'ADMIN',
      reason || 'Rescheduled by Organization Admin'
    );

    res.json({
      success: true,
      message: 'Customer appointment successfully rescheduled.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const adminCancel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const adminId = req.user!.userId;

    const updated = await cancelBooking(id, adminId, 'ADMIN', reason || 'Cancelled by Organization Admin');

    res.json({
      success: true,
      message: 'Appointment successfully cancelled.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const createConsultant = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const consultant = await Consultant.create(req.body);
    res.status(201).json({ success: true, data: consultant });
  } catch (error) {
    next(error);
  }
};

export const updateConsultant = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const consultant = await Consultant.findByIdAndUpdate(id, req.body, { new: true });
    if (!consultant) {
      res.status(404).json({ success: false, message: 'Consultant not found.' });
      return;
    }
    res.json({ success: true, data: consultant });
  } catch (error) {
    next(error);
  }
};

export const getRecentEmails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  res.json({ success: true, data: sentEmailsLog });
};

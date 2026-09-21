import { Request, Response, NextFunction } from 'express';
import { Consultant } from '../models/Consultant';
import { Review } from '../models/Review';
import { getAvailableSlotsForDate, getConsultantMonthAvailability } from '../services/slotService';

export const getAllConsultants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, domain } = req.query;

    const query: any = { isActive: true };

    if (domain && typeof domain === 'string' && domain !== 'All') {
      query.domain = domain;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { domain: regex }, { skills: regex }, { bio: regex }];
    }

    const consultants = await Consultant.find(query).sort({ rating: -1, reviewCount: -1 });

    // Extract unique domains for easy UI filter tags
    const domains = await Consultant.distinct('domain', { isActive: true });

    res.json({
      success: true,
      data: consultants,
      domains,
    });
  } catch (error) {
    next(error);
  }
};

export const getConsultantById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const consultant = await Consultant.findById(id);

    if (!consultant || !consultant.isActive) {
      res.status(404).json({
        success: false,
        message: 'Consultant not found or currently inactive.',
      });
      return;
    }

    // Fetch genuine customer reviews
    const reviews = await Review.find({ consultantId: consultant._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        ...consultant.toObject(),
        reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getConsultantMonth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1;

    const days = await getConsultantMonthAvailability(id, year, month);

    res.json({
      success: true,
      year,
      month,
      days,
    });
  } catch (error) {
    next(error);
  }
};

export const getConsultantDailySlots = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const date = req.query.date as string;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({
        success: false,
        message: 'Invalid date format. Expected YYYY-MM-DD.',
      });
      return;
    }

    const { slots, consultant } = await getAvailableSlotsForDate(id, date);

    res.json({
      success: true,
      date,
      consultant: {
        id: consultant._id,
        name: consultant.name,
        domain: consultant.domain,
        fee: consultant.fee,
        slotDuration: consultant.slotDuration,
        minNoticeHours: consultant.minNoticeHours,
      },
      slots,
    });
  } catch (error) {
    next(error);
  }
};

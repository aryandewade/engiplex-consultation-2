import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Consultant } from '../models/Consultant';
import { Review } from '../models/Review';
import { getAvailableSlotsForDate, getConsultantMonthAvailability } from '../services/slotService';

const ASHISH_LINKEDIN_PFP =
  'https://media.licdn.com/dms/image/v2/D5603AQHgvioDlx9_IQ/profile-displayphoto-crop_800_800/B56Z6Y4CHeKsAM-/0/1780681286875?e=1790812800&v=beta&t=cNJpjcdLhjrXD9yCIux7_f5gICB2sThInUDzYEbESkI';

const FALLBACK_ASHISH = {
  _id: '6aa67318006c980337f7ef0d',
  name: 'Ashish Lichode',
  email: 'ashish.lichode@consultflow.org',
  phone: '+91 98765 43210',
  avatar: ASHISH_LINKEDIN_PFP,
  domain: 'Engineering Consultant',
  bio: 'Principal Engineering Consultant with 12+ years experience mentoring engineering students, fresh graduates, and experienced engineers. Practical roadmaps for career transitions, resume enhancement, and high-growth tech roles.',
  skills: [
    'Career Roadmap',
    'Resume Strategy',
    'System Architecture',
    'Interview Prep',
    'Talent Mapping',
    'Project Management',
    'Data Analysis',
    'Data Engineering',
    'AI/ML',
    'Automotive',
    'Semiconductor',
    'Software Engineering',
  ],
  expertise: [
    'Career Roadmap',
    'Resume Strategy',
    'System Architecture',
    'Interview Prep',
    'Talent Mapping',
    'Project Management',
  ],
  technicalSkills: [
    'Data Analysis',
    'Data Engineering',
    'AI/ML',
    'Automotive',
    'Semiconductor',
    'Software Engineering',
  ],
  rating: 4.9,
  reviewCount: 48,
  fee: 999,
  slotDuration: 20,
  minNoticeHours: 0,
  workingDays: [0, 1, 2, 3, 4, 5, 6],
  workingHours: { start: '19:00', end: '21:00' },
  isActive: true,
};

export const getAllConsultants = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.json({
        success: true,
        data: [FALLBACK_ASHISH],
        domains: ['Engineering Consultant'],
      });
      return;
    }

    const { search, domain } = req.query;
    const query: any = { isActive: true };

    if (domain && typeof domain === 'string' && domain !== 'All') {
      query.domain = domain;
    }

    if (search && typeof search === 'string' && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { domain: regex }, { skills: regex }, { bio: regex }];
    }

    const consultants = await Consultant.find(query).sort({ rating: -1, reviewCount: -1 }).lean();
    const domains = await Consultant.distinct('domain', { isActive: true });

    res.json({
      success: true,
      data: consultants && consultants.length > 0 ? consultants : [FALLBACK_ASHISH],
      domains: domains && domains.length > 0 ? domains : ['Engineering Consultant'],
    });
  } catch (error) {
    // Return fallback instead of 500/timeout error
    res.json({
      success: true,
      data: [FALLBACK_ASHISH],
      domains: ['Engineering Consultant'],
    });
  }
};

export const getConsultantById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.json({
        success: true,
        data: {
          ...FALLBACK_ASHISH,
          reviews: [],
        },
      });
      return;
    }

    const { id } = req.params;
    let consultant: any = null;

    if (id && mongoose.Types.ObjectId.isValid(id)) {
      consultant = await Consultant.findById(id).lean();
    }

    if (!consultant) {
      consultant = await Consultant.findOne({
        isActive: true,
        name: { $regex: /ashish/i },
      }).lean();
    }

    if (!consultant) {
      consultant = await Consultant.findOne({ isActive: true }).lean();
    }

    if (!consultant) {
      consultant = FALLBACK_ASHISH;
    }

    const reviews = await Review.find({ consultantId: consultant._id }).sort({ createdAt: -1 }).lean().catch(() => []);

    res.json({
      success: true,
      data: {
        ...consultant,
        reviews,
      },
    });
  } catch (error) {
    res.json({
      success: true,
      data: {
        ...FALLBACK_ASHISH,
        reviews: [],
      },
    });
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

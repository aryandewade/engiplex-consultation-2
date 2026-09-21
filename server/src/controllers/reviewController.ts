import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { Review } from '../models/Review';
import { Consultant } from '../models/Consultant';
import { User } from '../models/User';
import { Booking } from '../models/Booking';

const createReviewSchema = z.object({
  consultantId: z.string().optional(),
  bookingId: z.string().optional(),
  email: z.string().email('Please provide a valid email address').optional(),
  userEmail: z.string().email('Please provide a valid email address').optional(),
  userName: z.string().min(2, 'Name must be at least 2 characters').optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  tag: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(5, 'Review comment must be at least 5 characters'),
});

export const addReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const body = createReviewSchema.parse(req.body);

    // Verify Email and Slot Booking Requirement
    const reviewerEmail = (body.email || body.userEmail || req.user?.email || '').toLowerCase().trim();
    if (!reviewerEmail) {
      res.status(400).json({
        success: false,
        message: 'Email address is required. Please enter the email you used when booking your session.',
      });
      return;
    }

    // 1. Verify a user exists with this email
    const user = await User.findOne({ email: reviewerEmail });
    if (!user) {
      res.status(403).json({
        success: false,
        message: 'No slot booking found for this email address. Only clients with a confirmed booking can submit a review.',
      });
      return;
    }

    // 2. Verify that this user has booked at least one slot
    const userBooking = await Booking.findOne({
      userId: user._id,
      status: { $ne: 'CANCELLED' },
    }).sort({ createdAt: -1 });

    if (!userBooking) {
      res.status(403).json({
        success: false,
        message: 'No slot booking found for this email address. Only clients with a confirmed booking can submit a review.',
      });
      return;
    }

    let targetConsultantId = body.consultantId || userBooking.consultantId?.toString();
    if (!targetConsultantId) {
      const activeConsultant = await Consultant.findOne({ isActive: true }) || await Consultant.findOne();
      if (activeConsultant) {
        targetConsultantId = activeConsultant._id.toString();
      }
    }

    if (!targetConsultantId) {
      res.status(400).json({ success: false, message: 'Target consultant not found.' });
      return;
    }

    let reviewerName = body.userName || body.name || user.name;
    const userAvatar = user.avatar;

    if (!reviewerName || !reviewerName.trim()) {
      reviewerName = 'Verified Client';
    }

    const review = await Review.create({
      consultantId: targetConsultantId,
      userId: user._id,
      bookingId: userBooking._id,
      userName: reviewerName.trim(),
      userEmail: reviewerEmail,
      userAvatar,
      rating: body.rating,
      comment: body.comment.trim(),
      tag: body.tag || 'Consulting',
    });

    // Recalculate consultant rating & review count
    const allReviews = await Review.find({ consultantId: targetConsultantId });
    const avgRating = allReviews.reduce((acc, r) => acc + r.rating, 0) / (allReviews.length || 1);

    await Consultant.findByIdAndUpdate(targetConsultantId, {
      rating: parseFloat(avgRating.toFixed(1)),
      reviewCount: allReviews.length,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Review published.',
      data: review,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllReviews = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { search, limit } = req.query;
    const query: any = {};

    if (search && typeof search === 'string' && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ userName: regex }, { comment: regex }];
    }

    const reviewLimit = limit ? parseInt(limit as string) : 100;
    const reviews = await Review.find(query).sort({ createdAt: -1 }).limit(reviewLimit);
    const totalCount = await Review.countDocuments();

    res.json({
      success: true,
      total: totalCount,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
};

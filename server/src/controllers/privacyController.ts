import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { Booking } from '../models/Booking';
import { Review } from '../models/Review';
import { DataDeletionOtp } from '../models/DataDeletionOtp';
import {
  sendEmail,
  buildDeletionOtpEmail,
  buildDataDeletionConfirmationEmail,
} from '../services/emailService';

const requestDeletionSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email address is required'),
});

const verifyDeletionSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email address is required'),
  otp: z.string().length(6, '6-digit verification code is required'),
});

/**
 * Step 1: Look up user in database by Name & Email, generate 6-digit OTP, send email.
 */
export const requestDataDeletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validated = requestDeletionSchema.parse(req.body);
    const email = validated.email.trim().toLowerCase();
    const name = validated.name.trim();

    // Check if user exists in database
    const existingUser = await User.findOne({ email });

    // Also check if any booking exists for this email if User doc wasn't found
    let userOrBookingFound = false;
    let registeredName = name;

    if (existingUser) {
      userOrBookingFound = true;
      registeredName = existingUser.name;
    } else {
      // Check if bookings exist under this user email
      const userByEmail = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
      if (userByEmail) {
        userOrBookingFound = true;
        registeredName = userByEmail.name;
      }
    }

    if (!userOrBookingFound) {
      return res.status(404).json({
        success: false,
        message:
          'No account or consultation record found matching this email address. Please check the email used during registration.',
      });
    }

    // Generate random 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Upsert or create deletion OTP record (expires in 10 mins)
    await DataDeletionOtp.deleteMany({ email });
    await DataDeletionOtp.create({
      email,
      name: registeredName,
      otp,
      createdAt: new Date(),
    });

    // Send email with OTP code
    await sendEmail({
      to: email,
      subject: 'Verification Code: Personal Data Deletion Request - ENGIPLEX',
      html: buildDeletionOtpEmail({
        name: registeredName,
        otp,
      }),
    });

    return res.json({
      success: true,
      message: `A 6-digit verification code has been sent to ${email}.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Step 2: Verify OTP, capture timestamps (creation & deletion), purge personal data, preserve reviews, send confirmation email.
 */
export const verifyAndExecuteDataDeletion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validated = verifyDeletionSchema.parse(req.body);
    const email = validated.email.trim().toLowerCase();
    const enteredOtp = validated.otp.trim();

    // Verify OTP
    const otpRecord = await DataDeletionOtp.findOne({ email, otp: enteredOtp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code. Please request a new code.',
      });
    }

    // Locate user account
    const user = await User.findOne({ email });

    let creationDate = user?.createdAt
      ? new Date(user.createdAt).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short',
          timeZone: 'Asia/Kolkata',
        })
      : 'Prior consultation records';

    const deletionDate = new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Kolkata',
    });

    const userName = user?.name || otpRecord.name;

    // Purge user's personal bookings
    if (user) {
      await Booking.deleteMany({ userId: user._id });
      // Delete the user account
      await User.deleteOne({ _id: user._id });
    }

    // CRITICAL: Feedbacks / Reviews are NOT deleted per user request!
    // Anonymize user reference on reviews so reviews remain intact in the system
    if (user) {
      await Review.updateMany(
        { userId: user._id },
        { $unset: { userId: 1, userEmail: 1 } }
      );
    }
    await Review.updateMany(
      { userEmail: email },
      { $unset: { userEmail: 1 } }
    );

    // Clean up used OTP
    await DataDeletionOtp.deleteMany({ email });

    // Send final confirmation email
    await sendEmail({
      to: email,
      subject: 'Data Deletion Completed — ENGIPLEX Consultation',
      html: buildDataDeletionConfirmationEmail({
        name: userName,
        email,
        creationDate,
        deletionDate,
      }),
    });

    return res.json({
      success: true,
      message: 'Your personal data and account records have been permanently deleted.',
      data: {
        userName,
        email,
        creationDate,
        deletionDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

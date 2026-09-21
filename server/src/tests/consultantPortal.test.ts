import { describe, it, expect, beforeAll } from 'bun:test';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Consultant } from '../models/Consultant';
import { Booking } from '../models/Booking';
import { reserveBookingSlot, verifyAndConfirmBooking } from '../services/bookingService';

describe('Consultant Portal & Mentor Bookings Sync', () => {
  let mentorUser: any;
  let clientUser: any;
  let mentorConsultant: any;
  let testBooking: any;

  beforeAll(async () => {
    await connectDB();

    mentorConsultant = await Consultant.findOne({ email: 'rahul.sharma@consultflow.org' });
    mentorUser = await User.findOne({ email: 'rahul.sharma@consultflow.org' });
    clientUser = await User.findOne({ email: 'client@example.com' });

    expect(mentorConsultant).toBeDefined();
    expect(mentorUser).toBeDefined();
    expect(clientUser).toBeDefined();
    expect(mentorUser.role).toBe('CONSULTANT');
    expect(mentorUser.consultantId.toString()).toBe(mentorConsultant._id.toString());
  });

  it('1. Client books an evening slot with Consultant with custom prep notes', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    const dateStr = futureDate.toISOString().split('T')[0];

    // Clean up if already booked
    await Booking.deleteMany({
      consultantId: mentorConsultant._id,
      date: dateStr,
      startTime: '19:00',
    });

    const reservation = await reserveBookingSlot({
      userId: clientUser._id.toString(),
      consultantId: mentorConsultant._id.toString(),
      date: dateStr,
      startTime: '19:00',
      customerNotes: 'Need detailed review of backend portfolio and system design roadmap.',
      isStudentOrFresher: true,
      collegeName: 'Pune Institute of Technology',
      graduationYear: 2026,
      promoCode: 'Engistud',
    });

    expect(reservation.booking).toBeDefined();
    expect(reservation.isFreeStudentBooking).toBe(true);
    expect(reservation.booking.status).toBe('CONFIRMED');

    testBooking = reservation.booking;
  });

  it('2. Consultant logs in and queries bookings for their profile', async () => {
    const todayStr = new Date().toISOString().split('T')[0];

    const bookings = await Booking.find({
      consultantId: mentorConsultant._id,
      status: { $in: ['CONFIRMED', 'COMPLETED', 'CANCELLED'] },
    }).populate('userId', 'name email phone avatar');

    expect(bookings.length).toBeGreaterThan(0);

    const found = bookings.find((b) => b._id.toString() === testBooking._id.toString());
    expect(found).toBeDefined();
    expect(found?.customerNotes).toBe('Need detailed review of backend portfolio and system design roadmap.');
    expect(found?.userId.name).toBe('Aditya Verma');
    expect(found?.isStudentOrFresher).toBe(true);
  });

  it('3. Consultant marks appointment as completed', async () => {
    testBooking.status = 'COMPLETED';
    await testBooking.save();

    const updated = await Booking.findById(testBooking._id);
    expect(updated?.status).toBe('COMPLETED');
  });
});

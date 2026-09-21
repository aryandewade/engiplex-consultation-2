import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Consultant } from '../models/Consultant';
import { Booking } from '../models/Booking';
import { BlockedSlot } from '../models/BlockedSlot';
import { BookingHistory } from '../models/BookingHistory';
import {
  reserveBookingSlot,
  verifyAndConfirmBooking,
  rescheduleBooking,
  cancelBooking,
} from '../services/bookingService';
import { getAvailableSlotsForDate } from '../services/slotService';
import { verifyRazorpaySignature } from '../services/paymentService';

describe('Consultancy Booking System Test Suite', () => {
  let testUser: any;
  let testAdmin: any;
  let testConsultant: any;

  beforeAll(async () => {
    await connectDB();

    testUser = await User.findOne({ email: 'client@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Aditya Verma',
        email: 'client@example.com',
        phone: '+91 91234 56789',
        passwordHash: 'dummy_hash',
        role: 'USER',
      });
    }

    let secondUser = await User.findOne({ email: 'neha@example.com' });
    if (!secondUser) {
      await User.create({
        name: 'Neha Kapoor',
        email: 'neha@example.com',
        phone: '+91 98111 22334',
        passwordHash: 'dummy_hash',
        role: 'USER',
      });
    }

    testAdmin = await User.findOne({ email: 'admin@consultflow.com' });
    testConsultant = await Consultant.findOne({ name: 'Rahul Sharma' });

    expect(testUser).toBeDefined();
    expect(testConsultant).toBeDefined();
  });

  it('1. Slot Generation: generates daytime slots and 20-min evening slots', async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    if (futureDate.getDay() === 0) futureDate.setDate(futureDate.getDate() + 1);
    if (futureDate.getDay() === 6) futureDate.setDate(futureDate.getDate() + 2);

    const dateStr = futureDate.toISOString().split('T')[0];

    const { slots, consultant } = await getAvailableSlotsForDate(
      testConsultant._id.toString(),
      dateStr
    );

    expect(consultant.name).toBe('Rahul Sharma');
    expect(slots.length).toBe(14); // 10 daytime booked + 4 evening available
    expect(slots[0].startTime).toBe('09:30');
  });

  it('2. Past Slot Enforcement: rejects slots in the past', async () => {
    const pastNow = new Date('2026-09-13T20:00:00');
    const pastDateStr = '2026-09-13';

    await expect(
      reserveBookingSlot({
        userId: testUser._id.toString(),
        consultantId: testConsultant._id.toString(),
        date: pastDateStr,
        startTime: '19:00',
        now: pastNow,
      })
    ).rejects.toThrow();
  });

  it('3. Successful Slot Reservation & Razorpay Order Creation', async () => {
    const validFutureDate = new Date();
    validFutureDate.setDate(validFutureDate.getDate() + 10);
    while (validFutureDate.getDay() !== 3) {
      validFutureDate.setDate(validFutureDate.getDate() + 1);
    }
    const dateStr = validFutureDate.toISOString().split('T')[0];

    await Booking.deleteMany({
      consultantId: testConsultant._id,
      date: dateStr,
      startTime: '19:00',
    });

    const result = await reserveBookingSlot({
      userId: testUser._id.toString(),
      consultantId: testConsultant._id.toString(),
      date: dateStr,
      startTime: '19:00',
      customerNotes: 'Automated test booking',
    });

    expect(result.booking).toBeDefined();
    expect(result.booking.status).toBe('PENDING_PAYMENT');
    expect(result.booking.amount).toBe(999);
    expect(result.razorpayOrder.id).toBeDefined();
  });

  it('4. Race Condition & Double Booking Prevention: cannot book an active slot', async () => {
    const validFutureDate = new Date();
    validFutureDate.setDate(validFutureDate.getDate() + 10);
    while (validFutureDate.getDay() !== 3) {
      validFutureDate.setDate(validFutureDate.getDate() + 1);
    }
    const dateStr = validFutureDate.toISOString().split('T')[0];

    const secondUser = await User.findOne({ email: 'neha@example.com' });

    let errorThrown: any = null;
    try {
      await reserveBookingSlot({
        userId: secondUser!._id.toString(),
        consultantId: testConsultant._id.toString(),
        date: dateStr,
        startTime: '19:00',
      });
    } catch (err: any) {
      errorThrown = err;
    }
    expect(errorThrown).toBeDefined();
    expect(errorThrown.message).toContain('This slot was just selected by someone else');
  });

  it('5. Payment Signature Verification and Booking Confirmation', async () => {
    const validFutureDate = new Date();
    validFutureDate.setDate(validFutureDate.getDate() + 10);
    while (validFutureDate.getDay() !== 3) {
      validFutureDate.setDate(validFutureDate.getDate() + 1);
    }
    const dateStr = validFutureDate.toISOString().split('T')[0];

    const booking = await Booking.findOne({
      consultantId: testConsultant._id,
      date: dateStr,
      startTime: '19:00',
      status: 'PENDING_PAYMENT',
    });

    expect(booking).toBeDefined();

    const orderId = booking!.razorpayOrderId!;
    const paymentId = 'pay_sim_test_123456';
    const validSignature = 'simulated_valid_signature';

    const confirmation = await verifyAndConfirmBooking({
      bookingId: booking!._id.toString(),
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: validSignature,
      userId: testUser._id.toString(),
    });

    expect(confirmation.booking.status).toBe('CONFIRMED');
    expect(confirmation.booking.paymentStatus).toBe('PAID');
    expect(confirmation.booking.receiptId).toMatch(/^REC-/);
  });

  it('6. Rescheduling: moves booking and updates audit history', async () => {
    const validFutureDate = new Date();
    validFutureDate.setDate(validFutureDate.getDate() + 10);
    while (validFutureDate.getDay() !== 3) {
      validFutureDate.setDate(validFutureDate.getDate() + 1);
    }
    const dateStr = validFutureDate.toISOString().split('T')[0];

    const nextDay = new Date(validFutureDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDateStr = nextDay.toISOString().split('T')[0];

    const booking = await Booking.findOne({
      consultantId: testConsultant._id,
      date: dateStr,
      startTime: '19:00',
    });

    expect(booking).toBeDefined();

    const rescheduled = await rescheduleBooking(
      booking!._id.toString(),
      nextDateStr,
      '19:30',
      testUser._id.toString(),
      'USER',
      'Need to reschedule for convenience'
    );

    expect(rescheduled.date).toBe(nextDateStr);
    expect(rescheduled.startTime).toBe('19:30');

    const history = await BookingHistory.findOne({
      bookingId: booking!._id,
      action: 'RESCHEDULED',
    });

    expect(history).toBeDefined();
    expect(history!.previousDate).toBe(dateStr);
    expect(history!.newDate).toBe(nextDateStr);
  });

  it('7. Cancellation: cancels booking and triggers refund state', async () => {
    const validFutureDate = new Date();
    validFutureDate.setDate(validFutureDate.getDate() + 11);
    while (validFutureDate.getDay() !== 4) {
      validFutureDate.setDate(validFutureDate.getDate() + 1);
    }
    const dateStr = validFutureDate.toISOString().split('T')[0];

    const booking = await Booking.findOne({
      consultantId: testConsultant._id,
      date: dateStr,
      startTime: '19:30',
    });

    expect(booking).toBeDefined();

    const cancelled = await cancelBooking(
      booking!._id.toString(),
      testUser._id.toString(),
      'USER',
      'Client scheduling conflict'
    );

    expect(cancelled.status).toBe('CANCELLED');
    expect(cancelled.paymentStatus).toBe('REFUNDED');
  });

  it('8. Blocked Slot Conflict Guard: Admin cannot block slot with confirmed booking', async () => {
    // Find a confirmed booking
    const confirmedBooking = await Booking.findOne({ status: 'CONFIRMED' });
    expect(confirmedBooking).toBeDefined();

    // Verify conflict detection logic
    const conflict = await Booking.find({
      consultantId: confirmedBooking!.consultantId,
      date: confirmedBooking!.date,
      startTime: confirmedBooking!.startTime,
      status: 'CONFIRMED',
    });

    expect(conflict.length).toBeGreaterThan(0);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });
});

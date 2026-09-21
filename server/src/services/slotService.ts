import { Consultant, IConsultant } from '../models/Consultant';
import { Booking } from '../models/Booking';
import { BlockedSlot } from '../models/BlockedSlot';

export interface TimeSlot {
  startTime: string; // "19:00"
  endTime: string;   // "19:20"
  status: 'Available' | 'Booked' | 'Unavailable';
  reason?: string;
  isEveningSlot?: boolean;
}

export interface DayAvailability {
  date: string; // "YYYY-MM-DD"
  dayOfWeek: number;
  status: 'available' | 'fully_booked' | 'unavailable' | 'past';
  slotsAvailableCount: number;
  totalSlotsCount: number;
}

/**
 * Daytime slots (09:30 AM to 07:00 PM) shown as already booked
 */
export const DAYTIME_BOOKED_SLOTS: { startTime: string; endTime: string }[] = [
  { startTime: '09:30', endTime: '10:30' },
  { startTime: '10:30', endTime: '11:30' },
  { startTime: '11:30', endTime: '12:30' },
  { startTime: '12:30', endTime: '13:30' },
  { startTime: '13:30', endTime: '14:30' },
  { startTime: '14:30', endTime: '15:30' },
  { startTime: '15:30', endTime: '16:30' },
  { startTime: '16:30', endTime: '17:30' },
  { startTime: '17:30', endTime: '18:30' },
  { startTime: '18:30', endTime: '19:00' },
];

/**
 * Evening slots (07:00 PM to 09:00 PM)
 * 20 min session + 10 min break
 */
export const EVENING_AVAILABLE_SLOTS: { startTime: string; endTime: string }[] = [
  { startTime: '19:00', endTime: '19:20' }, // 07:00 PM – 07:20 PM (10m break until 19:30)
  { startTime: '19:30', endTime: '19:50' }, // 07:30 PM – 07:50 PM (10m break until 20:00)
  { startTime: '20:00', endTime: '20:20' }, // 08:00 PM – 08:20 PM (10m break until 20:30)
  { startTime: '20:30', endTime: '20:50' }, // 08:30 PM – 08:50 PM (finish by 21:00)
];

export const calculateEndTime = (startTime: string, durationMinutes: number = 20): string => {
  const [h, m] = startTime.split(':').map(Number);
  const totalMinutes = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMinutes / 60);
  const endM = totalMinutes % 60;
  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
};

export const generateDefaultSlots = (): { startTime: string; endTime: string }[] => {
  return [...DAYTIME_BOOKED_SLOTS, ...EVENING_AVAILABLE_SLOTS];
};

/**
 * Core Slot Availability Engine
 */
export const getAvailableSlotsForDate = async (
  consultantId: string,
  dateStr: string, // "YYYY-MM-DD"
  now: Date = new Date()
): Promise<{ slots: TimeSlot[]; consultant: IConsultant }> => {
  const consultant = await Consultant.findById(consultantId);
  if (!consultant || !consultant.isActive) {
    throw new Error('Consultant is not active or could not be found.');
  }

  // Parse target date
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const dayOfWeek = targetDate.getDay();

  // Check blocked slots / full day holidays
  const blockedEntries = await BlockedSlot.find({
    consultantId,
    date: dateStr,
  });
  const isFullDayBlocked = blockedEntries.some((b) => b.isFullDay);
  const blockedTimesMap = new Map<string, string>();
  blockedEntries.forEach((b) => {
    if (b.startTime) {
      blockedTimesMap.set(b.startTime, b.reason || 'Blocked by administrator');
    }
  });

  // Query existing active bookings for this consultant on this date
  const activeBookings = await Booking.find({
    consultantId,
    date: dateStr,
    $or: [
      { status: 'CONFIRMED' },
      {
        status: 'PENDING_PAYMENT',
        expiresAt: { $gt: now },
      },
    ],
  });

  const bookedSlotsMap = new Map<string, string>();
  activeBookings.forEach((b) => {
    bookedSlotsMap.set(b.startTime, b.status);
  });

  const slots: TimeSlot[] = [];

  // 1. Add daytime slots (09:30 - 19:00) strictly as "Booked" / "Booked already"
  for (const daySlot of DAYTIME_BOOKED_SLOTS) {
    slots.push({
      startTime: daySlot.startTime,
      endTime: daySlot.endTime,
      status: 'Booked',
      reason: 'Booked already',
      isEveningSlot: false,
    });
  }

  // 2. Process Evening slots (19:00 - 21:00, 20min each with 10min breaks)
  for (const eveSlot of EVENING_AVAILABLE_SLOTS) {
    const [slotH, slotM] = eveSlot.startTime.split(':').map(Number);
    const slotDateTime = new Date(year, month - 1, day, slotH, slotM, 0);

    // If full day blocked
    if (isFullDayBlocked) {
      slots.push({
        startTime: eveSlot.startTime,
        endTime: eveSlot.endTime,
        status: 'Unavailable',
        reason: 'Full day holiday / off',
        isEveningSlot: true,
      });
      continue;
    }

    // If specific slot blocked
    if (blockedTimesMap.has(eveSlot.startTime)) {
      slots.push({
        startTime: eveSlot.startTime,
        endTime: eveSlot.endTime,
        status: 'Unavailable',
        reason: blockedTimesMap.get(eveSlot.startTime),
        isEveningSlot: true,
      });
      continue;
    }

    // If booked by user
    if (bookedSlotsMap.has(eveSlot.startTime)) {
      slots.push({
        startTime: eveSlot.startTime,
        endTime: eveSlot.endTime,
        status: 'Booked',
        reason: 'Booked by client',
        isEveningSlot: true,
      });
      continue;
    }

    // If slot has passed
    if (slotDateTime.getTime() <= now.getTime()) {
      slots.push({
        startTime: eveSlot.startTime,
        endTime: eveSlot.endTime,
        status: 'Unavailable',
        reason: 'Slot has passed',
        isEveningSlot: true,
      });
      continue;
    }

    // Available Evening Slot
    slots.push({
      startTime: eveSlot.startTime,
      endTime: eveSlot.endTime,
      status: 'Available',
      isEveningSlot: true,
    });
  }

  return { slots, consultant };
};

/**
 * Returns month overview with day availability states
 */
export const getConsultantMonthAvailability = async (
  consultantId: string,
  year: number,
  month: number, // 1 to 12
  now: Date = new Date()
): Promise<DayAvailability[]> => {
  const consultant = await Consultant.findById(consultantId);
  if (!consultant) throw new Error('Consultant not found.');

  const daysInMonth = new Date(year, month, 0).getDate();
  const dayResults: DayAvailability[] = [];

  const startMonthStr = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endMonthStr = `${year}-${month.toString().padStart(2, '0')}-${daysInMonth.toString().padStart(2, '0')}`;

  const [activeBookings, blockedSlots] = await Promise.all([
    Booking.find({
      consultantId,
      date: { $gte: startMonthStr, $lte: endMonthStr },
      $or: [
        { status: 'CONFIRMED' },
        { status: 'PENDING_PAYMENT', expiresAt: { $gt: now } },
      ],
    }),
    BlockedSlot.find({
      consultantId,
      date: { $gte: startMonthStr, $lte: endMonthStr },
    }),
  ]);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    const dayDate = new Date(year, month - 1, d);
    const dayOfWeek = dayDate.getDay();

    // Past date check
    const endOfDay = new Date(year, month - 1, d, 23, 59, 59);
    if (endOfDay.getTime() < now.getTime()) {
      dayResults.push({
        date: dateStr,
        dayOfWeek,
        status: 'past',
        slotsAvailableCount: 0,
        totalSlotsCount: EVENING_AVAILABLE_SLOTS.length,
      });
      continue;
    }

    // Full day blocked
    const dayBlocks = blockedSlots.filter((b) => b.date === dateStr);
    if (dayBlocks.some((b) => b.isFullDay)) {
      dayResults.push({
        date: dateStr,
        dayOfWeek,
        status: 'unavailable',
        slotsAvailableCount: 0,
        totalSlotsCount: EVENING_AVAILABLE_SLOTS.length,
      });
      continue;
    }

    // Count available evening slots
    const dayBookings = activeBookings.filter((b) => b.date === dateStr);
    const bookedStarts = new Set(dayBookings.map((b) => b.startTime));
    const blockedStarts = new Set(dayBlocks.filter((b) => b.startTime).map((b) => b.startTime));

    let availableCount = 0;
    for (const slot of EVENING_AVAILABLE_SLOTS) {
      const [h, m] = slot.startTime.split(':').map(Number);
      const slotTime = new Date(year, month - 1, d, h, m, 0);

      if (slotTime.getTime() <= now.getTime()) continue;
      if (bookedStarts.has(slot.startTime)) continue;
      if (blockedStarts.has(slot.startTime)) continue;

      availableCount++;
    }

    // A day is strictly fully booked ONLY when EVERY evening consultation slot of that day has been booked!
    const allSlotsBooked =
      EVENING_AVAILABLE_SLOTS.length > 0 &&
      EVENING_AVAILABLE_SLOTS.every((slot) => bookedStarts.has(slot.startTime));

    let status: 'available' | 'fully_booked' | 'unavailable' | 'past' = 'available';
    if (allSlotsBooked) {
      status = 'fully_booked';
    } else if (availableCount > 0) {
      status = 'available';
    } else {
      // If no slots are available but not all slots were booked (e.g. today's slot times passed),
      // mark as 'past', NOT 'fully_booked'
      status = 'past';
    }

    dayResults.push({
      date: dateStr,
      dayOfWeek,
      status,
      slotsAvailableCount: availableCount,
      totalSlotsCount: EVENING_AVAILABLE_SLOTS.length,
    });
  }

  return dayResults;
};

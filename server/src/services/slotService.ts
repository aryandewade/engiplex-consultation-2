import mongoose from 'mongoose';
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

const DEFAULT_FALLBACK_CONSULTANT: IConsultant = {
  _id: '6aa67318006c980337f7ef0d',
  name: 'Ashish Lichode',
  email: 'ashish.lichode@consultflow.org',
  phone: '+91 98765 43210',
  avatar: 'https://media.licdn.com/dms/image/v2/D5603AQHgvioDlx9_IQ/profile-displayphoto-crop_800_800/B56Z6Y4CHeKsAM-/0/1780681286875?e=1790812800&v=beta&t=cNJpjcdLhjrXD9yCIux7_f5gICB2sThInUDzYEbESkI',
  domain: 'Engineering Consultant',
  bio: 'Principal Engineering Consultant with 12+ years experience mentoring engineering students, fresh graduates, and experienced engineers.',
  skills: ['Career Roadmap', 'Resume Strategy', 'System Architecture', 'Interview Prep'],
  expertise: ['Career Roadmap', 'Resume Strategy'],
  technicalSkills: ['Data Analysis', 'Data Engineering', 'AI/ML'],
  rating: 4.9,
  reviewCount: 48,
  fee: 999,
  slotDuration: 20,
  minNoticeHours: 0,
  workingDays: [0, 1, 2, 3, 4, 5, 6],
  workingHours: { start: '19:00', end: '21:00' },
  meetingLink: 'https://meet.google.com/ioy-bouu-eih',
  isActive: true,
} as unknown as IConsultant;

/**
 * Core Slot Availability Engine
 */
export const getAvailableSlotsForDate = async (
  consultantId: string,
  dateStr: string, // "YYYY-MM-DD"
  now: Date = new Date()
): Promise<{ slots: TimeSlot[]; consultant: IConsultant }> => {
  // Parse target date
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDateObj = new Date(year, month - 1, day);
  const dayOfWeek = targetDateObj.getDay();
  const isSunday = dayOfWeek === 0;
  const MIN_NOTICE_MS = 24 * 60 * 60 * 1000; // 24 hours minimum notice

  // If DB is offline / reconnecting, generate slots in-memory instantly
  if (mongoose.connection.readyState !== 1) {
    const slots: TimeSlot[] = [];

    // Daytime slots (09:30 - 19:00)
    for (const daySlot of DAYTIME_BOOKED_SLOTS) {
      if (isSunday) {
        const [slotH, slotM] = daySlot.startTime.split(':').map(Number);
        const slotDateTime = new Date(year, month - 1, day, slotH, slotM, 0);
        const isPast = slotDateTime.getTime() <= now.getTime();
        const isWithin24h = slotDateTime.getTime() - now.getTime() < MIN_NOTICE_MS;

        slots.push({
          startTime: daySlot.startTime,
          endTime: daySlot.endTime,
          status: isPast || isWithin24h ? 'Unavailable' : 'Available',
          reason: isPast
            ? 'Slot has passed'
            : isWithin24h
            ? 'Requires 24 hours advance notice'
            : undefined,
          isEveningSlot: false,
        });
      } else {
        slots.push({
          startTime: daySlot.startTime,
          endTime: daySlot.endTime,
          status: 'Booked',
          reason: 'Booked already',
          isEveningSlot: false,
        });
      }
    }

    // Evening slots (19:00 - 21:00)
    for (const eveSlot of EVENING_AVAILABLE_SLOTS) {
      const [slotH, slotM] = eveSlot.startTime.split(':').map(Number);
      const slotDateTime = new Date(year, month - 1, day, slotH, slotM, 0);
      const isPast = slotDateTime.getTime() <= now.getTime();
      const isWithin24h = slotDateTime.getTime() - now.getTime() < MIN_NOTICE_MS;

      slots.push({
        startTime: eveSlot.startTime,
        endTime: eveSlot.endTime,
        status: isPast || isWithin24h ? 'Unavailable' : 'Available',
        reason: isPast
          ? 'Slot has passed'
          : isWithin24h
          ? 'Requires 24 hours advance notice'
          : undefined,
        isEveningSlot: true,
      });
    }

    return { slots, consultant: DEFAULT_FALLBACK_CONSULTANT };
  }

  let consultant: any = null;
  if (consultantId && mongoose.Types.ObjectId.isValid(consultantId)) {
    consultant = await Consultant.findById(consultantId).lean();
  }
  if (!consultant) {
    consultant = await Consultant.findOne({ isActive: true, name: { $regex: /ashish/i } }).lean().catch(() => null);
  }
  if (!consultant) {
    consultant = await Consultant.findOne({ isActive: true }).lean().catch(() => null);
  }

  if (!consultant) {
    consultant = DEFAULT_FALLBACK_CONSULTANT;
  }

  const resolvedConsultantId = consultant._id;

  const [blockedEntries, activeBookings] = await Promise.all([
    BlockedSlot.find({
      consultantId: resolvedConsultantId,
      date: dateStr,
    }).lean(),
    Booking.find({
      consultantId: resolvedConsultantId,
      date: dateStr,
      $or: [
        { status: 'CONFIRMED' },
        {
          status: 'PENDING_PAYMENT',
          expiresAt: { $gt: now },
        },
      ],
    }).lean(),
  ]);

  const isFullDayBlocked = blockedEntries.some((b) => b.isFullDay);
  const blockedTimesMap = new Map<string, string>();
  blockedEntries.forEach((b) => {
    if (b.startTime) {
      blockedTimesMap.set(b.startTime, b.reason || 'Blocked by administrator');
    }
  });

  const bookedSlotsMap = new Map<string, string>();
  activeBookings.forEach((b) => {
    bookedSlotsMap.set(b.startTime, b.status);
  });

  const slots: TimeSlot[] = [];

  // 1. Process Daytime slots (09:30 - 19:00)
  // On SUNDAYS: All daytime slots are open & available!
  // On WEEKDAYS (Mon-Sat): Daytime slots are marked as "Booked already"
  for (const daySlot of DAYTIME_BOOKED_SLOTS) {
    if (isSunday) {
      const [slotH, slotM] = daySlot.startTime.split(':').map(Number);
      const slotDateTime = new Date(year, month - 1, day, slotH, slotM, 0);

      if (isFullDayBlocked) {
        slots.push({
          startTime: daySlot.startTime,
          endTime: daySlot.endTime,
          status: 'Unavailable',
          reason: 'Full day holiday / off',
          isEveningSlot: false,
        });
        continue;
      }

      if (blockedTimesMap.has(daySlot.startTime)) {
        slots.push({
          startTime: daySlot.startTime,
          endTime: daySlot.endTime,
          status: 'Unavailable',
          reason: blockedTimesMap.get(daySlot.startTime),
          isEveningSlot: false,
        });
        continue;
      }

      if (bookedSlotsMap.has(daySlot.startTime)) {
        slots.push({
          startTime: daySlot.startTime,
          endTime: daySlot.endTime,
          status: 'Booked',
          reason: 'Booked by client',
          isEveningSlot: false,
        });
        continue;
      }

      if (slotDateTime.getTime() <= now.getTime()) {
        slots.push({
          startTime: daySlot.startTime,
          endTime: daySlot.endTime,
          status: 'Unavailable',
          reason: 'Slot has passed',
          isEveningSlot: false,
        });
        continue;
      }

      if (slotDateTime.getTime() - now.getTime() < MIN_NOTICE_MS) {
        slots.push({
          startTime: daySlot.startTime,
          endTime: daySlot.endTime,
          status: 'Unavailable',
          reason: 'Requires 24 hours advance notice',
          isEveningSlot: false,
        });
        continue;
      }

      // Available Daytime Slot on Sunday
      slots.push({
        startTime: daySlot.startTime,
        endTime: daySlot.endTime,
        status: 'Available',
        isEveningSlot: false,
      });
    } else {
      slots.push({
        startTime: daySlot.startTime,
        endTime: daySlot.endTime,
        status: 'Booked',
        reason: 'Booked already',
        isEveningSlot: false,
      });
    }
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

    // If within 24 hours advance notice window
    if (slotDateTime.getTime() - now.getTime() < MIN_NOTICE_MS) {
      slots.push({
        startTime: eveSlot.startTime,
        endTime: eveSlot.endTime,
        status: 'Unavailable',
        reason: 'Requires 24 hours advance notice',
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
  const daysInMonth = new Date(year, month, 0).getDate();
  const dayResults: DayAvailability[] = [];
  const MIN_NOTICE_MS = 24 * 60 * 60 * 1000;

  // If DB is offline / reconnecting, generate in-memory availability instantly
  if (mongoose.connection.readyState !== 1) {
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      const dayDate = new Date(year, month - 1, d);
      const dayOfWeek = dayDate.getDay();
      const isSunday = dayOfWeek === 0;

      const candidateSlots = isSunday
        ? [...DAYTIME_BOOKED_SLOTS, ...EVENING_AVAILABLE_SLOTS]
        : EVENING_AVAILABLE_SLOTS;

      let availableCount = 0;
      for (const slot of candidateSlots) {
        const [h, m] = slot.startTime.split(':').map(Number);
        const slotTime = new Date(year, month - 1, d, h, m, 0);
        if (slotTime.getTime() - now.getTime() >= MIN_NOTICE_MS) {
          availableCount++;
        }
      }

      dayResults.push({
        date: dateStr,
        dayOfWeek,
        status: availableCount > 0 ? 'available' : 'past',
        slotsAvailableCount: availableCount,
        totalSlotsCount: candidateSlots.length,
      });
    }
    return dayResults;
  }

  let consultant: any = null;
  if (consultantId && mongoose.Types.ObjectId.isValid(consultantId)) {
    consultant = await Consultant.findById(consultantId).lean();
  }
  if (!consultant) {
    consultant = await Consultant.findOne({ isActive: true, name: { $regex: /ashish/i } }).lean().catch(() => null);
  }
  if (!consultant) {
    consultant = await Consultant.findOne({ isActive: true }).lean().catch(() => null);
  }

  const resolvedConsultantId = consultant?._id || '6aa67318006c980337f7ef0d';

  const startMonthStr = `${year}-${month.toString().padStart(2, '0')}-01`;
  const endMonthStr = `${year}-${month.toString().padStart(2, '0')}-${daysInMonth.toString().padStart(2, '0')}`;

  const [activeBookings, blockedSlots] = await Promise.all([
    Booking.find({
      consultantId: resolvedConsultantId,
      date: { $gte: startMonthStr, $lte: endMonthStr },
      $or: [
        { status: 'CONFIRMED' },
        { status: 'PENDING_PAYMENT', expiresAt: { $gt: now } },
      ],
    }).lean(),
    BlockedSlot.find({
      consultantId: resolvedConsultantId,
      date: { $gte: startMonthStr, $lte: endMonthStr },
    }).lean(),
  ]);

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
    const dayDate = new Date(year, month - 1, d);
    const dayOfWeek = dayDate.getDay();
    const isSunday = dayOfWeek === 0;

    const candidateSlots = isSunday
      ? [...DAYTIME_BOOKED_SLOTS, ...EVENING_AVAILABLE_SLOTS]
      : EVENING_AVAILABLE_SLOTS;

    // Full day blocked
    const dayBlocks = blockedSlots.filter((b) => b.date === dateStr);
    if (dayBlocks.some((b) => b.isFullDay)) {
      dayResults.push({
        date: dateStr,
        dayOfWeek,
        status: 'unavailable',
        slotsAvailableCount: 0,
        totalSlotsCount: candidateSlots.length,
      });
      continue;
    }

    // Count available slots
    const dayBookings = activeBookings.filter((b) => b.date === dateStr);
    const bookedStarts = new Set(dayBookings.map((b) => b.startTime));
    const blockedStarts = new Set(dayBlocks.filter((b) => b.startTime).map((b) => b.startTime));

    let availableCount = 0;
    for (const slot of candidateSlots) {
      const [h, m] = slot.startTime.split(':').map(Number);
      const slotTime = new Date(year, month - 1, d, h, m, 0);

      // Must be at least 24 hours in advance
      if (slotTime.getTime() - now.getTime() < MIN_NOTICE_MS) continue;
      if (bookedStarts.has(slot.startTime)) continue;
      if (blockedStarts.has(slot.startTime)) continue;

      availableCount++;
    }

    const allSlotsBooked =
      candidateSlots.length > 0 &&
      candidateSlots.every((slot) => bookedStarts.has(slot.startTime));

    let status: 'available' | 'fully_booked' | 'unavailable' | 'past' = 'available';
    if (allSlotsBooked) {
      status = 'fully_booked';
    } else if (availableCount > 0) {
      status = 'available';
    } else {
      // If no slots are available because notice is < 24h or in the past
      status = 'past';
    }

    dayResults.push({
      date: dateStr,
      dayOfWeek,
      status,
      slotsAvailableCount: availableCount,
      totalSlotsCount: candidateSlots.length,
    });
  }

  return dayResults;
};

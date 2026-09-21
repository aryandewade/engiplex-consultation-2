import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Consultant, TimeSlot, DayAvailability } from '../types';
import { RazorpayModal } from '../components/RazorpayModal';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Calendar as CalendarIcon,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Info,
  Tag,
  GraduationCap,
  Sparkles,
  UserCheck,
  Mail,
  User as UserIcon,
} from 'lucide-react';

interface BookingFlowProps {
  consultantId: string;
  onNavigate: (path: string) => void;
}

const formatDisplayDate = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const months: Record<string, string> = {
      '01': 'Jan',
      '02': 'Feb',
      '03': 'Mar',
      '04': 'Apr',
      '05': 'May',
      '06': 'Jun',
      '07': 'Jul',
      '08': 'Aug',
      '09': 'Sept',
      '10': 'Oct',
      '11': 'Nov',
      '12': 'Dec',
    };
    const month = months[parts[1]] || parts[1];
    const year = parts[0];
    return `${day} ${month} ${year}`;
  }
  return dateStr;
};

export const BookingFlow: React.FC<BookingFlowProps> = ({ consultantId, onNavigate }) => {
  const { user, isAuthenticated, setSession } = useAuth();

  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [loadingConsultant, setLoadingConsultant] = useState(true);

  // Client Details (taken for email confirmation, session booking, and receipt generation)
  const [clientEmail, setClientEmail] = useState(user?.email || '');
  const [clientName, setClientName] = useState(user?.name || '');
  const [clientPhone, setClientPhone] = useState(user?.phone || '');

  useEffect(() => {
    if (user) {
      if (!clientEmail) setClientEmail(user.email);
      if (!clientName) setClientName(user.name);
      if (!clientPhone && user.phone) setClientPhone(user.phone);
    }
  }, [user]);

  // Calendar states
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-indexed
  const [monthDays, setMonthDays] = useState<DayAvailability[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(false);

  // Slot states
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Booking & Notes
  const [customerNotes, setCustomerNotes] = useState('');
  const [isReserving, setIsReserving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [razorpayOrderData, setRazorpayOrderData] = useState<any | null>(null);
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);

  // Student & Promo Code States
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Student / Fresher Verification Fields
  const [studentYear, setStudentYear] = useState<string>('3rd Year');
  const [stream, setStream] = useState<string>('Computer Science & Engineering');
  const [graduationYear, setGraduationYear] = useState<string>('2025');
  const [collegeName, setCollegeName] = useState<string>('');

  // Terms & Conditions Consent State
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Load consultant profile
  useEffect(() => {
    fetchConsultant();
  }, [consultantId]);

  // Load monthly availability overview
  useEffect(() => {
    fetchMonthAvailability();
  }, [consultantId, currentYear, currentMonth]);

  // Load daily slots when a date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchDailySlots(selectedDate);
    }
  }, [selectedDate]);

  const fetchConsultant = async () => {
    try {
      const res = await apiRequest<{ success: boolean; data: Consultant }>(
        `/consultants/${consultantId}`
      );
      setConsultant(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingConsultant(false);
    }
  };

  const fetchMonthAvailability = async () => {
    setLoadingMonth(true);
    try {
      const res = await apiRequest<{
        success: boolean;
        days: DayAvailability[];
      }>(`/consultants/${consultantId}/availability?year=${currentYear}&month=${currentMonth}`);
      setMonthDays(res.days);

      // Auto-select first available future date if none selected
      if (!selectedDate) {
        const firstAvailable = res.days.find((d) => d.status === 'available');
        if (firstAvailable) {
          setSelectedDate(firstAvailable.date);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMonth(false);
    }
  };

  const fetchDailySlots = async (dateStr: string) => {
    setLoadingSlots(true);
    setSelectedSlot(null);
    setErrorMessage(null);
    try {
      const res = await apiRequest<{
        success: boolean;
        slots: TimeSlot[];
      }>(`/consultants/${consultantId}/slots?date=${dateStr}`);
      setSlots(res.slots);
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || 'Failed to load slots for this date.');
    } finally {
      setLoadingSlots(false);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Promo Code Validation Handler
  const handleApplyPromo = () => {
    setPromoError(null);
    const cleaned = promoCodeInput.trim();
    if (!cleaned) {
      setPromoError('Please enter a valid promo code.');
      return;
    }

    if (cleaned.toLowerCase() === 'engistud') {
      setAppliedPromo('Engistud');
      setPromoError(null);
    } else {
      setPromoError('Invalid coupon code.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCodeInput('');
    setPromoError(null);
  };

  const isStudentFree = appliedPromo === 'Engistud';
  const effectiveFee = isStudentFree ? 0 : 999;

  const handleProceedToPayment = async () => {
    if (!selectedSlot || !selectedDate) {
      setErrorMessage('Please select an available date and evening time slot first.');
      return;
    }

    // Validate email and name for confirmation & receipt
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!clientEmail || !emailRegex.test(clientEmail.trim())) {
      setErrorMessage('Please provide a valid email address so we can send your appointment link and official receipt.');
      return;
    }

    if (!clientName.trim()) {
      setErrorMessage('Please enter your full name for the booking appointment and invoice.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('Please accept the Terms & Conditions and Privacy Policy to proceed with your booking.');
      return;
    }

    // Strict validation for Engistud student verification
    if (isStudentFree) {
      if (!graduationYear || parseInt(graduationYear) < 2024) {
        setErrorMessage('Please select a valid graduation year (2024 onwards) for student verification.');
        return;
      }
      if (!studentYear) {
        setErrorMessage('Please select your current student year.');
        return;
      }
      if (!stream.trim()) {
        setErrorMessage('Please specify your academic stream/branch.');
        return;
      }
    }

    setIsReserving(true);
    setErrorMessage(null);

    try {
      const payload: any = {
        consultantId,
        date: selectedDate,
        startTime: selectedSlot.startTime,
        customerNotes,
        clientName: clientName.trim(),
        clientEmail: clientEmail.trim().toLowerCase(),
        clientPhone: clientPhone.trim() || undefined,
      };

      if (isStudentFree) {
        payload.promoCode = 'Engistud';
        payload.isStudentOrFresher = true;
        payload.graduationYear = parseInt(graduationYear);
        payload.studentYear = studentYear;
        payload.stream = stream.trim();
        payload.collegeName = collegeName.trim() || 'Verified University';
      }

      // Reserve slot on backend
      const res = await apiRequest<{
        success: boolean;
        message?: string;
        data: {
          booking: any;
          razorpayOrder?: any;
          razorpayKeyId?: string;
          isFreeStudentBooking?: boolean;
          token?: string;
          user?: any;
        };
      }>('/bookings/reserve', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const { booking, razorpayOrder, isFreeStudentBooking, token: sessionToken, user: sessionUser } = res.data;

      // Automatically store user session for guest bookings
      if (sessionToken && sessionUser) {
        setSession(sessionUser, sessionToken);
      }

      // If student session is 100% Free, skip payment gateway and redirect to confirmed booking directly!
      if (isFreeStudentBooking || booking.amount === 0) {
        onNavigate(`/booking/${booking._id}`);
        return;
      }

      // Otherwise, open Razorpay checkout modal for ₹999 standard fee
      setRazorpayOrderData({
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        bookingId: booking._id,
        consultantName: consultant?.name || 'Mentor',
        date: selectedDate,
        startTime: selectedSlot.startTime,
      });

      setIsRazorpayModalOpen(true);
    } catch (error: any) {
      console.error('Reservation failed:', error);
      setErrorMessage(
        error.message || 'This slot could not be reserved. Please select another time.'
      );
      if (selectedDate) fetchDailySlots(selectedDate);
    } finally {
      setIsReserving(false);
    }
  };

  const handlePaymentSuccess = async (paymentId: string, signature: string) => {
    setIsRazorpayModalOpen(false);
    try {
      const res = await apiRequest<{ success: boolean; data: any }>('/bookings/confirm', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: razorpayOrderData.bookingId,
          razorpayOrderId: razorpayOrderData.orderId,
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
        }),
      });

      onNavigate(`/booking/${res.data._id}`);
    } catch (error: any) {
      setErrorMessage('Payment verification error: ' + error.message);
    }
  };

  const handlePaymentFailure = async (failureMsg: string) => {
    setIsRazorpayModalOpen(false);
    setErrorMessage(failureMsg);
    if (selectedDate) fetchDailySlots(selectedDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonthIndex = new Date(currentYear, currentMonth - 1, 1).getDay();

  // Split slots into daytime (09:30-19:00, booked) and evening (19:00-21:00, 20-min slots)
  const daytimeBookedSlots = slots.filter((s) => {
    const startHour = parseInt(s.startTime.split(':')[0]);
    return startHour < 19;
  });

  const eveningAvailableSlots = slots.filter((s) => {
    const startHour = parseInt(s.startTime.split(':')[0]);
    return startHour >= 19;
  });

  if (loadingConsultant || !consultant) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-zinc-400">
        Loading scheduling interface...
      </div>
    );
  }

  return (
    <div className="w-[94%] sm:w-[82%] max-w-6xl mx-auto px-2 sm:px-4 py-8 space-y-8 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => onNavigate(`/consultants/${consultantId}`)}
        className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 transition-colors font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to {consultant.name}’s profile
      </button>

      {/* Booking Header */}
      <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative inline-block shrink-0">
            <img
              src={
                consultant.name.toLowerCase().includes('ashish')
                  ? 'https://media.licdn.com/dms/image/v2/D5603AQHgvioDlx9_IQ/profile-displayphoto-crop_800_800/B56Z6Y4CHeKsAM-/0/1780681286875?e=1790812800&v=beta&t=cNJpjcdLhjrXD9yCIux7_f5gICB2sThInUDzYEbESkI'
                  : consultant.avatar
              }
              alt={consultant.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border border-zinc-200 shadow-sm"
            />
            <ShieldCheck
              className="absolute top-1 right-1 w-4 h-4 text-emerald-400 drop-shadow-[0_1px_4px_rgba(0,0,0,0.85)] pointer-events-none"
              aria-label="Verified Mentor"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-bold text-zinc-900">
                Book session with {consultant.name}
              </h1>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-xs text-emerald-700 font-semibold">
              {consultant.domain === 'Engineering Leader & Career Consultant'
                ? 'Engineering Consultant'
                : consultant.domain}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 mt-1 tabular-nums">
              <span className="text-zinc-900 font-semibold">Standard: ₹999/- per hour</span>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3 animate-fade-in shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Split Calendar & Slots View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Calendar (col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-zinc-900 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-emerald-600" />
              {monthNames[currentMonth - 1]} {currentYear}
            </h2>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors border border-zinc-200"
                title="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors border border-zinc-200"
                title="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider py-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {[...Array(firstDayOfMonthIndex)].map((_, i) => (
              <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-xl sm:rounded-2xl" />
            ))}

            {monthDays.map((dayObj) => {
              const isSelected = selectedDate === dayObj.date;
              const isPast = dayObj.status === 'past';
              const isUnavailable = dayObj.status === 'unavailable';
              const isFullyBooked = dayObj.status === 'fully_booked';
              const isAvailable = dayObj.status === 'available';

              const dayNumber = parseInt(dayObj.date.split('-')[2]);

              return (
                <button
                  key={dayObj.date}
                  disabled={isPast || isUnavailable || isFullyBooked}
                  onClick={() => setSelectedDate(dayObj.date)}
                  className={`relative h-16 sm:h-20 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold tabular-nums transition-all flex flex-col items-center justify-between p-2 sm:p-2.5 overflow-hidden ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20 scale-105 z-10'
                      : isAvailable
                        ? 'bg-white hover:bg-emerald-50/70 text-zinc-800 border border-zinc-200 hover:border-emerald-500 shadow-xs hover:scale-[1.02]'
                        : isFullyBooked
                          ? 'bg-rose-50/70 border border-rose-200/80 text-zinc-400 cursor-not-allowed select-none'
                          : 'bg-zinc-50 text-zinc-300 cursor-not-allowed border border-zinc-100'
                  }`}
                >
                  <span
                    className={`font-bold transition-opacity ${
                      isSelected
                        ? 'text-white'
                        : isFullyBooked
                          ? 'text-zinc-400/50'
                          : isAvailable
                            ? 'text-zinc-800'
                            : 'text-zinc-300'
                    }`}
                  >
                    {dayNumber}
                  </span>

                  {/* Status Indicator at bottom */}
                  {isSelected && (
                    <>
                      <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-emerald-100 uppercase hidden sm:inline">
                        Selected
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white sm:hidden" />
                    </>
                  )}

                  {!isSelected && isAvailable && (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[9px] sm:text-[10px] font-medium text-emerald-600 hidden sm:inline">
                        Available
                      </span>
                    </div>
                  )}

                  {!isSelected && (isPast || isUnavailable) && (
                    <span className="text-[9px] sm:text-[10px] font-medium text-zinc-300 hidden sm:inline">
                      {isPast ? 'Past' : 'Off'}
                    </span>
                  )}

                  {/* Diagonal Red Booked Style */}
                  {isFullyBooked && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden rounded-xl sm:rounded-2xl">
                      <span className="transform -rotate-45 text-[9px] sm:text-[10px] font-black tracking-widest text-red-600 uppercase border border-red-300/80 bg-red-100/90 px-1.5 py-0.5 rounded shadow-2xs select-none">
                        BOOKED
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="pt-4 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-zinc-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Available (7:00 – 9:00 PM)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block text-[8px] font-black text-red-600 border border-red-300 bg-red-100 px-1 py-0.5 rounded -rotate-12">
                BOOKED
              </span>
              <span>Fully Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-300" />
              <span>Off / Notice Limit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Selected</span>
            </div>
          </div>
        </div>

        {/* Right Side: Slots & Student Verification Flow (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-zinc-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <h3 className="font-display text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Time slots for {selectedDate ? formatDisplayDate(selectedDate) : 'Select Date'}
                </h3>

              </div>

              {selectedSlot && (
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 tabular-nums">
                  {selectedSlot.startTime} Selected
                </span>
              )}
            </div>

            {loadingSlots ? (
              <div className="py-12 text-center text-xs text-zinc-500 space-y-2">
                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <span>Checking real-time slot availability...</span>
              </div>
            ) : slots.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                Select a valid future date on the calendar to view slots.
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. Available Evening Slots: 7:00 PM - 9:00 PM */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Available Slots (7:00 PM – 9:00 PM)
                    </span>
                    <span className="text-[10px] text-zinc-500">20 min slot</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {eveningAvailableSlots.map((s) => {
                      const isAvailable = s.status === 'Available';
                      const isSelected = selectedSlot?.startTime === s.startTime;

                      return (
                        <button
                          key={s.startTime}
                          disabled={!isAvailable}
                          onClick={() => setSelectedSlot(s)}
                          className={`p-3 rounded-xl text-left border transition-all text-xs font-medium flex items-center justify-between ${isSelected
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-500'
                              : isAvailable
                                ? 'border-zinc-200 bg-white hover:bg-emerald-50/50 hover:border-emerald-400 text-zinc-800 shadow-sm'
                                : 'border-zinc-100 bg-zinc-50 text-zinc-400 cursor-not-allowed'
                            }`}
                        >
                          <div>
                            <span className="font-bold text-zinc-900 block">
                              {s.startTime} – {s.endTime}
                            </span>
                            <span className="text-[10px] text-zinc-500">20 min slot</span>
                          </div>
                          <span
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${isAvailable
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-zinc-100 text-zinc-500'
                              }`}
                          >
                            {isAvailable ? 'Available' : 'Booked'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Daytime Slots (9:30 AM – 7:00 PM): Booked Already */}
                <div className="space-y-2 pt-2 border-t border-zinc-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-zinc-400" />
                      Day Slots (9:30 AM – 7:00 PM)
                    </span>
                    <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                      Booked Already
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {daytimeBookedSlots.map((s) => (
                      <div
                        key={s.startTime}
                        className="p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-400 flex items-center justify-between opacity-70 cursor-not-allowed"
                        title="Booked already"
                      >
                        <span>{s.startTime} – {s.endTime}</span>
                        <span className="text-[9px] uppercase font-semibold bg-zinc-200 text-zinc-600 px-1 py-0.5 rounded">
                          Booked
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Client Details for Confirmation & Official Receipt */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  Email & Details for Confirmation
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                  Instant Receipt
                </span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. yourname@example.com"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full rounded-xl bg-white border border-zinc-300 px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 shadow-sm"
                  />
                  <span className="text-[10px] text-zinc-500 mt-0.5 block">
                    Your Google Meet link, calendar invite & official tax receipt will be sent here.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aryan Dewade"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full rounded-xl bg-white border border-zinc-300 px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. +91 98765 43210"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full rounded-xl bg-white border border-zinc-300 px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Code & Student Verification Section */}
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  Promo / Student Code
                </span>
                {appliedPromo && (
                  <button
                    onClick={handleRemovePromo}
                    className="text-[10px] font-semibold text-red-500 hover:underline"
                  >
                    Remove Code
                  </button>
                )}
              </div>

              {!appliedPromo ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter promo code"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    className="flex-1 rounded-xl bg-white border border-zinc-300 px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600"
                  />
                  <button
                    onClick={handleApplyPromo}
                    className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-xs font-semibold text-white transition-colors"
                  >
                    Apply
                  </button>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <span>100% Student Fee Waiver Applied</span>
                  </div>
                  <span className="font-mono text-emerald-700 font-bold">-₹999</span>
                </div>
              )}

              {promoError && (
                <p className="text-[11px] text-red-600">{promoError}</p>
              )}

              {/* Student or Fresher Verification Form */}
              {appliedPromo === 'Engistud' && (
                <div className="pt-3 border-t border-zinc-200 space-y-3 animate-fade-in">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900">
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    <span>Student / Fresher Details</span>
                  </div>

                  <div className="space-y-2.5">
                    {/* Student Year */}
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                        Current Student Year *
                      </label>
                      <select
                        value={studentYear}
                        onChange={(e) => setStudentYear(e.target.value)}
                        className="w-full rounded-xl bg-white border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-emerald-600"
                      >
                        <option value="1st Year">1st Year (Freshman)</option>
                        <option value="2nd Year">2nd Year (Sophomore)</option>
                        <option value="3rd Year">3rd Year (Junior)</option>
                        <option value="4th Year">4th Year (Final Year)</option>
                        <option value="Graduated / Fresher">Graduated / Fresher</option>
                        <option value="Postgraduate / Masters">Postgraduate / Masters</option>
                      </select>
                    </div>

                    {/* Stream / Branch */}
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                        Stream / Branch *
                      </label>
                      <input
                        type="text"
                        list="stream-options"
                        placeholder="e.g. Computer Science, Mechanical, IT, AI/ML"
                        value={stream}
                        onChange={(e) => setStream(e.target.value)}
                        className="w-full rounded-xl bg-white border border-zinc-300 px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600"
                      />
                      <datalist id="stream-options">
                        <option value="Computer Science & Engineering" />
                        <option value="Information Technology" />
                        <option value="Artificial Intelligence & Data Science" />
                        <option value="Electronics & Telecommunication" />
                        <option value="Electrical Engineering" />
                        <option value="Mechanical Engineering" />
                        <option value="Civil Engineering" />
                        <option value="Chemical Engineering" />
                        <option value="Biotechnology" />
                      </datalist>
                    </div>

                    {/* Graduation Year starting from 2024 to so on */}
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                        Graduation Year (2024 onwards) *
                      </label>
                      <select
                        value={graduationYear}
                        onChange={(e) => setGraduationYear(e.target.value)}
                        className="w-full rounded-xl bg-white border border-zinc-300 px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-emerald-600"
                      >
                        <option value="2024">2024 (Fresher)</option>
                        <option value="2025">2025 (Final Year / Fresher)</option>
                        <option value="2026">2026 (Current Student)</option>
                        <option value="2027">2027 (Current Student)</option>
                        <option value="2028">2028 (Current Student)</option>
                        <option value="2029">2029 (Undergraduate)</option>
                        <option value="2030">2030 (Undergraduate)</option>
                        <option value="2031">2031 (Undergraduate)</option>
                        <option value="2032">2032 (Undergraduate)</option>
                      </select>
                    </div>

                    {/* College / University Name */}
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                        College / University Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Pune Institute of Computer Technology / IIT"
                        value={collegeName}
                        onChange={(e) => setCollegeName(e.target.value)}
                        className="w-full rounded-xl bg-white border border-zinc-300 px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Optional Customer Notes */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-zinc-700">
                Session Focus / Career Questions (Optional)
              </label>
              <textarea
                rows={2}
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="What career direction, resume questions, or target roles would you like to cover?"
                className="w-full rounded-xl bg-white border border-zinc-300 p-3 text-xs text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 resize-none shadow-sm"
              />
            </div>

            {/* Summary & Checkout CTA */}
            <div className="pt-4 border-t border-zinc-200 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>Standard consultation fee</span>
                  <span className={`tabular-nums ${isStudentFree ? 'line-through text-zinc-400' : 'text-zinc-900 font-medium'}`}>
                    ₹999/- per hour
                  </span>
                </div>

                {isStudentFree && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 font-semibold">
                    <span>Student / fresher fee waiver</span>
                    <span className="tabular-nums">-₹999</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
                  <span className="text-xs font-bold text-zinc-900">Total amount due</span>
                  <span className="font-display text-xl font-black text-zinc-900 tabular-nums">
                    {isStudentFree ? (
                      <span className="text-emerald-700 font-black">FREE (₹0)</span>
                    ) : (
                      '₹999/-'
                    )}
                  </span>
                </div>
              </div>

              {/* Terms & Privacy Policy Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs text-zinc-600 group">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer accent-emerald-600 shrink-0"
                  />
                  <span className="leading-snug">
                    I have read and agree to the{' '}
                    <a
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-emerald-600 font-semibold underline hover:text-emerald-700"
                    >
                      Terms &amp; Conditions
                    </a>{' '}
                    and{' '}
                    <a
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-emerald-600 font-semibold underline hover:text-emerald-700"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
              </div>

              <button
                disabled={!selectedSlot || isReserving}
                onClick={handleProceedToPayment}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${isStudentFree
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  }`}
              >
                {isReserving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Confirming booking...</span>
                  </>
                ) : isStudentFree ? (
                  <>
                    <GraduationCap className="w-4 h-4" />
                    <span>Confirm free student session</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Proceed to Razorpay checkout (₹999)</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-zinc-500 text-center">
                {isStudentFree
                  ? 'Complimentary session for students & freshers verified via graduation year & student ID.'
                  : 'Slot is temporarily reserved for 10 minutes upon proceeding to payment.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Razorpay Interactive Modal (for ₹999 non-student bookings) */}
      {razorpayOrderData && (
        <RazorpayModal
          isOpen={isRazorpayModalOpen}
          onClose={() => setIsRazorpayModalOpen(false)}
          orderData={razorpayOrderData}
          onSuccess={handlePaymentSuccess}
          onFailure={handlePaymentFailure}
        />
      )}
    </div>
  );
};

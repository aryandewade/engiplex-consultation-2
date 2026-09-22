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

const ASHISH_LINKEDIN_PFP =
  'https://media.licdn.com/dms/image/v2/D5603AQHgvioDlx9_IQ/profile-displayphoto-crop_800_800/B56Z6Y4CHeKsAM-/0/1780681286875?e=1790812800&v=beta&t=cNJpjcdLhjrXD9yCIux7_f5gICB2sThInUDzYEbESkI';

const DEFAULT_ASHISH: Consultant = {
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

export const BookingFlow: React.FC<BookingFlowProps> = ({ consultantId, onNavigate }) => {
  const { user, isAuthenticated, setSession } = useAuth();

  const [consultant, setConsultant] = useState<Consultant>(DEFAULT_ASHISH);
  const [loadingConsultant, setLoadingConsultant] = useState(false);

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
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  });
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

  // Parallel Initial Fetch for Consultant Profile and Month Availability
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        const [consultantRes, monthRes] = await Promise.all([
          apiRequest<{ success: boolean; data: Consultant }>(`/consultants/${consultantId}`).catch(async () => {
            const all = await apiRequest<{ success: boolean; data: Consultant[] }>('/consultants');
            const c = all.data?.find((x) => x.name.toLowerCase().includes('ashish')) || all.data?.[0];
            return { success: true, data: c || DEFAULT_ASHISH };
          }),
          apiRequest<{ success: boolean; days: DayAvailability[] }>(
            `/consultants/${consultantId}/availability?year=${currentYear}&month=${currentMonth}`
          ).catch(() => ({ success: true, days: [] })),
        ]);

        if (isMounted) {
          if (consultantRes?.data) {
            setConsultant(consultantRes.data);
          }
          if (monthRes?.days && monthRes.days.length > 0) {
            setMonthDays(monthRes.days);
            const firstAvailable = monthRes.days.find((d) => d.status === 'available');
            if (firstAvailable) {
              setSelectedDate(firstAvailable.date);
            }
          }
        }
      } catch (e) {
        console.error('Failed to load scheduling data:', e);
      } finally {
        if (isMounted) {
          setLoadingConsultant(false);
          setLoadingMonth(false);
        }
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [consultantId, currentYear, currentMonth]);

  // Load daily slots whenever a date is selected
  useEffect(() => {
    if (selectedDate) {
      fetchDailySlots(selectedDate);
    }
  }, [selectedDate, consultantId]);

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
      setErrorMessage('Please select an available date and time slot first.');
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

      const { booking, razorpayOrder, razorpayKeyId, isFreeStudentBooking, token: sessionToken, user: sessionUser } = res.data;

      // Automatically store user session for guest bookings
      if (sessionToken && sessionUser) {
        setSession(sessionUser, sessionToken);
      }

      // If student session is 100% Free / Pay What You Can, skip payment gateway and redirect to confirmed booking directly!
      if (isFreeStudentBooking || booking?.amount === 0 || isStudentFree) {
        onNavigate(`/booking/${booking._id}`);
        return;
      }

      // Otherwise, open standard Razorpay Checkout Gateway Window
      const orderPayload = {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || 'INR',
        bookingId: booking._id,
        consultantName: consultant?.name || 'Mentor',
        date: selectedDate,
        startTime: selectedSlot.startTime,
      };
      setRazorpayOrderData(orderPayload);

      const activeKeyId = razorpayKeyId || 'rzp_test_TZ6ZiC4bWbn52f';

      if (typeof (window as any).Razorpay !== 'undefined') {
        const rzpOptions = {
          key: activeKeyId,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency || 'INR',
          name: 'ENGIPLEX Consultation',
          description: `1-on-1 Consultation with ${consultant?.name || 'Mentor'} (${selectedDate} at ${selectedSlot.startTime})`,
          image: '/engiplex-logo.png',
          order_id: razorpayOrder.id,
          prefill: {
            name: clientName.trim(),
            email: clientEmail.trim(),
            contact: clientPhone.trim() || '9876543210',
          },
          notes: {
            bookingId: booking._id,
            consultantId,
            date: selectedDate,
            startTime: selectedSlot.startTime,
          },
          theme: {
            color: '#059669', // Emerald brand theme
          },
          handler: async function (response: any) {
            await handlePaymentSuccess(
              response.razorpay_payment_id,
              response.razorpay_signature,
              response.razorpay_order_id || razorpayOrder.id,
              booking._id
            );
          },
          modal: {
            ondismiss: function () {
              console.log('[Razorpay] Payment window closed.');
            },
          },
        };

        const rzp = new (window as any).Razorpay(rzpOptions);
        rzp.on('payment.failed', function (response: any) {
          handlePaymentFailure(
            response?.error?.description || 'Payment was declined or cancelled by bank.'
          );
        });
        rzp.open();
      } else {
        // Fallback to custom modal if script blocked
        setIsRazorpayModalOpen(true);
      }
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

  const handlePaymentSuccess = async (
    paymentId: string,
    signature: string,
    orderIdParam?: string,
    bookingIdParam?: string
  ) => {
    setIsRazorpayModalOpen(false);
    try {
      const targetBookingId = bookingIdParam || razorpayOrderData?.bookingId;
      const targetOrderId = orderIdParam || razorpayOrderData?.orderId;

      const res = await apiRequest<{ success: boolean; data: any }>('/bookings/confirm', {
        method: 'POST',
        body: JSON.stringify({
          bookingId: targetBookingId,
          razorpayOrderId: targetOrderId,
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

  const isSunday = selectedDate ? new Date(selectedDate.replace(/-/g, '/')).getDay() === 0 : false;

  const daytimeSlots = slots.filter((s) => {
    const startHour = parseInt(s.startTime.split(':')[0], 10);
    return startHour < 19;
  });

  const eveningSlots = slots.filter((s) => {
    const startHour = parseInt(s.startTime.split(':')[0], 10);
    return startHour >= 19;
  });

  if (loadingConsultant || !consultant) {
    return (
      <div className="w-[94%] sm:w-[82%] max-w-6xl mx-auto px-2 sm:px-4 py-8 space-y-8 animate-pulse">
        <div className="h-4 w-36 bg-zinc-200 rounded-lg" />
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 sm:p-8 flex items-center gap-4">
          <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-zinc-200 shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-6 w-64 bg-zinc-200 rounded-lg" />
            <div className="h-4 w-40 bg-zinc-200 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200 h-96" />
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-zinc-200 h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-[94%] sm:w-[82%] max-w-6xl mx-auto px-2 sm:px-4 py-6 sm:py-8 space-y-6">
      {/* Back to home button */}
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Consultant Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-7 border border-zinc-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="relative inline-block shrink-0">
            <img
              src={consultant.avatar}
              alt={consultant.name}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border border-zinc-200 shadow-sm"
            />
            <ShieldCheck
              className="absolute top-0.5 right-0.5 w-4 h-4 text-emerald-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] pointer-events-none"
              aria-label="Verified Mentor"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-lg sm:text-xl font-bold text-zinc-900">
                {consultant.name}
              </h1>
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            </div>
            <p className="text-xs sm:text-sm text-emerald-700 font-semibold">{consultant.domain}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-zinc-600">
              <span className="font-bold text-zinc-900 flex items-center gap-0.5">
                ★ {consultant.rating}
              </span>
              <span>•</span>
              <span>{consultant.reviewCount} Verified Consultations</span>
            </div>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-zinc-200">
          <span className="text-[11px] text-zinc-600 uppercase font-bold tracking-wider">
            Consultation Fee
          </span>
          <div className="text-right">
            {isStudentFree ? (
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <span className="text-sm line-through text-zinc-400 font-semibold">₹999</span>
                  <span className="font-display text-xl sm:text-2xl font-black text-emerald-600">
                    Pay What You Can
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold block">
                  Only for Freshers &amp; Students
                </span>
              </div>
            ) : (
              <span className="font-display text-2xl font-bold text-zinc-900">
                ₹{consultant.fee || 999}
              </span>
            )}
            <span className="text-[10px] text-zinc-600 block">per 1-on-1 strategy session</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-3 animate-fade-in shadow-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Booking Interface Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Interactive Calendar (col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 border border-zinc-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-bold text-zinc-900 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-600" />
                Select Consultation Date
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Book at least 24 hours in advance. Sundays open all day (9:30 AM – 9:00 PM).
              </p>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900 min-w-[120px] text-center">
                {monthNames[currentMonth - 1]} {currentYear}
              </span>
              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                <button
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg hover:bg-white text-zinc-600 hover:text-zinc-900 transition-colors shadow-2xs"
                  title="Previous Month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg hover:bg-white text-zinc-600 hover:text-zinc-900 transition-colors shadow-2xs"
                  title="Next Month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Calendar Grid Header: Days of Week */}
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-zinc-600 uppercase tracking-wider py-1 border-b border-zinc-200">
            <span className="text-emerald-700 font-extrabold">Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Day Tiles */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Empty padding tiles before the 1st day of month */}
            {Array.from({ length: firstDayOfMonthIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14 sm:h-18 rounded-xl bg-zinc-50/50" />
            ))}

            {/* Month Days */}
            {monthDays.map((dayObj) => {
              const dayNum = parseInt(dayObj.date.split('-')[2], 10);
              const isSelected = selectedDate === dayObj.date;
              const isAvailable = dayObj.status === 'available';
              const isFullyBooked = dayObj.status === 'fully_booked';
              const isPast = dayObj.status === 'past';
              const isUnavailable = dayObj.status === 'unavailable';
              const isDaySunday = dayObj.dayOfWeek === 0;

              return (
                <button
                  key={dayObj.date}
                  disabled={!isAvailable}
                  onClick={() => setSelectedDate(dayObj.date)}
                  className={`relative h-14 sm:h-18 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between text-left select-none group ${isSelected
                      ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/30'
                      : isAvailable
                        ? isDaySunday
                          ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-100/60 hover:border-emerald-500 text-zinc-900 cursor-pointer shadow-2xs'
                          : 'border-zinc-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/40 text-zinc-800 cursor-pointer shadow-2xs'
                        : isFullyBooked
                          ? 'border-red-200 bg-red-50/30 text-zinc-400 cursor-not-allowed overflow-hidden'
                          : 'border-zinc-100 bg-zinc-50 text-zinc-300 cursor-not-allowed'
                    }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-bold ${isSelected
                          ? 'text-white'
                          : isAvailable
                            ? isDaySunday
                              ? 'text-emerald-800'
                              : 'text-zinc-900'
                            : 'text-zinc-400'
                        }`}
                    >
                      {dayNum}
                    </span>
                    {isDaySunday && !isSelected && isAvailable && (
                      <span className="text-[8px] font-black text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded uppercase hidden sm:inline">
                        All Day
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <>
                      <span className="text-[10px] font-bold text-emerald-100 hidden sm:inline">
                        Selected
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-white sm:hidden" />
                    </>
                  )}

                  {!isSelected && isAvailable && (
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[9px] sm:text-[10px] font-medium text-emerald-600 hidden sm:inline">
                        {isDaySunday ? '14 Slots' : 'Available'}
                      </span>
                    </div>
                  )}

                  {!isSelected && (isPast || isUnavailable) && (
                    <span className="text-[9px] sm:text-[10px] font-medium text-zinc-400 hidden sm:inline">
                      {isPast ? 'Past / <24h' : 'Off'}
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
              <span>Available (Sundays All Day / Weekday Evenings)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block text-[8px] font-black text-red-600 border border-red-300 bg-red-100 px-1 py-0.5 rounded -rotate-12">
                BOOKED
              </span>
              <span>Fully Booked</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-300" />
              <span>&lt;24h Notice Limit / Past</span>
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
                {isSunday && (
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded mt-1 inline-block">
                    🌟 Sunday: All Day & Evening Slots Open
                  </span>
                )}
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
                Select a valid future date on the calendar (at least 24 hours in advance) to view slots.
              </div>
            ) : (
              <div className="space-y-4">
                {/* 1. Sunday Open Daytime Slots (9:30 AM – 7:00 PM) OR Weekday Locked Slots */}
                {isSunday ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Daytime Slots (9:30 AM – 7:00 PM)
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium">60 min session</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {daytimeSlots.map((s) => {
                        const isAvailable = s.status === 'Available';
                        const isSelected = selectedSlot?.startTime === s.startTime;

                        return (
                          <button
                            key={s.startTime}
                            disabled={!isAvailable}
                            onClick={() => setSelectedSlot(s)}
                            className={`p-2.5 rounded-xl text-left border transition-all text-xs font-medium flex items-center justify-between ${
                              isSelected
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
                              <span className="text-[10px] text-zinc-500">60 min</span>
                            </div>
                            <span
                              className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                isAvailable
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-zinc-100 text-zinc-500'
                              }`}
                            >
                              {isAvailable ? 'Available' : s.reason || 'Booked'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-zinc-400" />
                        Day Slots (9:30 AM – 7:00 PM)
                      </span>
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold">
                        Booked Already
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 max-h-28 overflow-y-auto pr-1">
                      {daytimeSlots.map((s) => (
                        <div
                          key={s.startTime}
                          className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-400 flex items-center justify-between opacity-70 cursor-not-allowed"
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
                )}

                {/* 2. Evening Slots: 7:00 PM - 9:00 PM (Available everyday) */}
                <div className="space-y-2 pt-2 border-t border-zinc-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Evening Slots (7:00 PM – 9:00 PM)
                    </span>
                    <span className="text-[10px] text-zinc-500">20 min slot</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {eveningSlots.map((s) => {
                      const isAvailable = s.status === 'Available';
                      const isSelected = selectedSlot?.startTime === s.startTime;

                      return (
                        <button
                          key={s.startTime}
                          disabled={!isAvailable}
                          onClick={() => setSelectedSlot(s)}
                          className={`p-3 rounded-xl text-left border transition-all text-xs font-medium flex items-center justify-between ${
                            isSelected
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
                            className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                              isAvailable
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-zinc-100 text-zinc-500'
                            }`}
                          >
                            {isAvailable ? 'Available' : s.reason || 'Booked'}
                          </span>
                        </button>
                      );
                    })}
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
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                    <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold block">Student / Fresher Initiative Applied</span>
                      <span className="text-[11px] text-emerald-700">Pay What You Can</span>
                    </div>
                  </div>
                  <span className="font-mono text-emerald-700 font-bold bg-emerald-100/80 px-2 py-0.5 rounded-md text-[11px]">Pay What You Can</span>
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
                    <span>Fresher / Student Initiative</span>
                    <span className="tabular-nums">-₹999</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-zinc-200">
                  <span className="text-xs font-bold text-zinc-900">Total amount due upfront</span>
                  <span className="font-display text-lg sm:text-xl font-black text-emerald-700 tabular-nums">
                    {isStudentFree ? (
                      <span>Pay What You Can</span>
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
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 cursor-pointer"
              >
                {isReserving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Confirming booking...</span>
                  </>
                ) : isStudentFree ? (
                  <>
                    <GraduationCap className="w-4 h-4" />
                    <span>Pay What You Can</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Proceed to Razorpay checkout (₹999)</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-zinc-600 text-center font-medium">
                {isStudentFree
                  ? 'No fixed fee — after the session, you decide what you’d like to pay'
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

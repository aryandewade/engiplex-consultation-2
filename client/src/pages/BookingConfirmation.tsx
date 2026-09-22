import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { apiRequest } from '../services/api';
import { Booking } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  CheckCircle2,
  Calendar,
  Clock,
  Video,
  FileText,
  ArrowRight,
  ShieldCheck,
  User,
  Copy,
  Check,
  Printer,
  Sparkles,
  Download,
} from 'lucide-react';

interface ConfirmationProps {
  bookingId: string;
  onNavigate: (path: string) => void;
}

const formatDisplayDate = (dateStr?: string) => {
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

export const BookingConfirmation: React.FC<ConfirmationProps> = ({ bookingId, onNavigate }) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBooking();
    // Confetti celebration
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const res = await apiRequest<{ success: boolean; data: Booking }>(`/bookings/${bookingId}`);
      setBooking(res.data);
    } catch (e) {
      console.error('Failed to load booking:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (booking?.meetingLink) {
      navigator.clipboard.writeText(booking.meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-zinc-500 text-sm">Loading confirmed appointment details...</p>
      </div>
    );
  }

  const consultant = typeof booking.consultantId === 'object' ? booking.consultantId : null;
  const customer = typeof booking.userId === 'object' ? booking.userId : null;
  const customerName = customer?.name || (booking as any).clientName || (booking as any).userName || 'Client';
  const customerEmail = customer?.email || (booking as any).clientEmail || (booking as any).userEmail || '';
  const isStudentPass = booking.amount === 0 || booking.isVerifiedStudent || booking.promoCode === 'Engistud';

  return (
    <div className="w-[94%] sm:w-[82%] max-w-4xl mx-auto px-2 sm:px-4 py-10 space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="text-center space-y-3 print:hidden">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
          Appointment Officially Confirmed!
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 max-w-lg mx-auto leading-relaxed">
          {isStudentPass
            ? 'Your Pay What You Can consultation (Student / Fresher Pass) is confirmed and your 1-on-1 slot is securely locked.'
            : `Your payment of ₹${booking.amount} has been verified and your 1-on-1 slot is securely locked.`}{' '}
          {customerEmail && (
            <span>
              Confirmation email and Google Meet invite have been dispatched to{' '}
              <strong className="text-zinc-900 font-semibold">{customerEmail}</strong>.
            </span>
          )}
        </p>
      </div>

      {/* Quick Meeting Action Callout */}
      <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 shadow-sm space-y-3 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Video className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-emerald-950 block">Google Meet Live Room</span>
              <span className="text-[11px] text-emerald-700">Join with mentor {consultant?.name || 'Ashish'} at scheduled time</span>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-900 border border-emerald-300 w-fit">
            Active Video Link
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-zinc-200 text-xs font-mono text-zinc-700">
          <span className="truncate">{booking.meetingLink || 'https://meet.google.com/ioy-bouu-eih'}</span>
          <button
            onClick={handleCopyLink}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors shrink-0 flex items-center gap-1 text-[11px] font-sans font-medium"
            title="Copy Meeting URL"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <a
          href={booking.meetingLink || 'https://meet.google.com/ioy-bouu-eih'}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <span>Join Google Meet</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* EMBEDDED OFFICIAL RECEIPT & TAX INVOICE */}
      <div className="bg-white border-2 border-zinc-200 rounded-3xl shadow-lg p-6 sm:p-10 space-y-6 text-zinc-900 print:border-none print:shadow-none print:p-0">
        {/* Receipt Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-200 pb-6">
          <div className="space-y-1">
            <img
              src="/engiplex-logo.png"
              alt="ENGIPLEX Consultation"
              className="h-10 sm:h-12 w-auto object-contain"
            />
            <p className="text-xs text-zinc-500 font-medium">
              Official Consultation Tax Invoice &amp; Verification Receipt
            </p>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {isStudentPass ? 'VERIFIED • PAY WHAT YOU CAN' : 'PAID & CONFIRMED'}
            </span>
            <div className="font-mono text-xs font-bold text-zinc-700 block">
              Receipt ID: <span className="text-zinc-900">{booking.receiptId || 'REC-CONFIRMED'}</span>
            </div>
            <div className="text-[11px] text-zinc-400">
              Issue Date: {new Date().toLocaleDateString('en-GB')}
            </div>
          </div>
        </div>

        {/* Client & Consultant Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs bg-zinc-50/70 p-4 sm:p-5 rounded-2xl border border-zinc-200">
          <div>
            <span className="text-zinc-400 uppercase tracking-wider font-bold text-[10px] block mb-1">
              Billed To (Client / Student)
            </span>
            <p className="font-bold text-zinc-900 text-sm">{customerName}</p>
            {customerEmail && <p className="text-zinc-600 font-medium">{customerEmail}</p>}
            {booking.collegeName && (
              <p className="text-emerald-800 text-[11px] font-semibold mt-1">
                🎓 {booking.collegeName} {booking.graduationYear ? `(Class of ${booking.graduationYear})` : ''}
              </p>
            )}
          </div>

          <div>
            <span className="text-zinc-400 uppercase tracking-wider font-bold text-[10px] block mb-1">
              Consultant / Advisor
            </span>
            <p className="font-bold text-zinc-900 text-sm">{consultant?.name || 'Ashish Lichode'}</p>
            <p className="text-zinc-600 font-medium">{consultant?.domain || 'Engineering Consultant'}</p>
            <p className="text-[11px] text-emerald-700 font-semibold">Verified Advisor • ENGIPLEX</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Appointment Summary</h3>
          <div className="border border-zinc-200 rounded-2xl overflow-hidden text-xs">
            <div className="bg-zinc-100 px-4 py-2.5 font-bold text-zinc-700 grid grid-cols-12 gap-2">
              <span className="col-span-6">Description</span>
              <span className="col-span-3 text-center">Schedule</span>
              <span className="col-span-3 text-right">Amount</span>
            </div>

            <div className="px-4 py-3.5 divide-y divide-zinc-100">
              <div className="grid grid-cols-12 gap-2 py-1 items-center">
                <div className="col-span-6">
                  <p className="font-bold text-zinc-900 text-xs sm:text-sm">
                    1-on-1 Engineering Consultation
                  </p>
                  <p className="text-zinc-500 text-[11px]">
                    Career Roadmap, Resume Strategy &amp; Technical Mentorship (20 Min Focused Session)
                  </p>
                </div>
                <div className="col-span-3 text-center text-zinc-700 font-medium">
                  <div>{formatDisplayDate(booking.date)}</div>
                  <div className="text-zinc-500 text-[11px] font-mono">{booking.startTime} – {booking.endTime}</div>
                </div>
                <div className="col-span-3 text-right font-bold text-zinc-900 text-xs sm:text-sm">
                  {isStudentPass ? 'Pay What You Can' : `₹${booking.amount}.00`}
                </div>
              </div>
            </div>

            {/* Total Row */}
            <div className="bg-zinc-50 border-t border-zinc-200 px-4 py-3 flex justify-between items-center text-xs sm:text-sm">
              <span className="font-bold text-zinc-800">
                {isStudentPass ? 'Total Amount (Student / Fresher Pass)' : 'Total Amount Paid'}
              </span>
              <span className="font-black text-emerald-700 text-base sm:text-lg">
                {isStudentPass ? 'Pay What You Can' : `₹${booking.amount}/-`}
              </span>
            </div>
          </div>
        </div>

        {/* Security & Verification Footer */}
        <div className="pt-4 border-t border-zinc-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-[11px] text-zinc-500">
          <div className="space-y-0.5">
            <p className="font-semibold text-zinc-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Electronic Invoice — DPDP 2023 &amp; IT Act Compliant
            </p>
            <p>Meeting link dispatched to: {customerEmail || 'your email'}</p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF Receipt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
        <button
          onClick={() => onNavigate('/')}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-zinc-300"
        >
          <span>Back to Home</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Modal fallback */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        booking={booking}
      />
    </div>
  );
};

export default BookingConfirmation;

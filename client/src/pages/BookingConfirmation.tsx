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
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchBooking();
    // Confetti effect
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

  if (loading || !booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-zinc-400">
        Loading confirmation details...
      </div>
    );
  }

  const consultant = typeof booking.consultantId === 'object' ? booking.consultantId : null;
  const customer = typeof booking.userId === 'object' ? booking.userId : null;
  const customerEmail = customer?.email || '';

  return (
    <div className="w-[94%] sm:w-[82%] max-w-4xl mx-auto px-2 sm:px-4 py-12 space-y-8 animate-fade-in">
      {/* Success Badge & Headline */}
      <div className="text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
          Appointment Officially Confirmed!
        </h1>
        <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
          {booking.amount === 0 || booking.isVerifiedStudent
            ? 'Your complimentary student consultation (100% Fee Waived) is confirmed and your 1-on-1 slot is securely locked.'
            : `Your payment of ₹${booking.amount} has been verified and your 1-on-1 slot is securely locked.`}{' '}
          {customerEmail ? (
            <span>
              Official receipt, invoice, and Google Meet invite have been dispatched to{' '}
              <strong className="text-zinc-900 font-semibold">{customerEmail}</strong>.
            </span>
          ) : (
            <span>Confirmation and calendar invite details have been dispatched to your email.</span>
          )}
        </p>
      </div>

      {/* Main Confirmation Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="relative inline-block shrink-0">
              <img
                src={consultant?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=mentor'}
                alt={consultant?.name}
                className="w-12 h-12 rounded-xl object-cover border border-zinc-200"
              />
              <ShieldCheck
                className="absolute top-0.5 right-0.5 w-3.5 h-3.5 text-emerald-400 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)] pointer-events-none"
                aria-label="Verified Mentor"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-zinc-900 text-sm">{consultant?.name}</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <p className="text-xs text-emerald-700 font-medium">{consultant?.domain}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Official Receipt</span>
            <span className="font-mono text-xs font-semibold text-zinc-700">{booking.receiptId}</span>
            {booking.isVerifiedStudent && (
              <span className="text-[10px] text-emerald-700 font-semibold block">🎓 Verified Student Waiver</span>
            )}
          </div>
        </div>

        {/* Schedule grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span>Confirmed Date</span>
            </div>
            <p className="text-sm font-semibold text-zinc-900">{formatDisplayDate(booking.date)}</p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Session Time & Duration</span>
            </div>
            <p className="text-sm font-semibold text-zinc-900">
              {booking.startTime} – {booking.endTime} (20 Min Focused Session)
            </p>
          </div>
        </div>

        {/* Video Meeting Room Callout */}
        <div className="p-5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
              <Video className="w-4 h-4 text-emerald-600" />
              <span>Secure Video Meeting Room</span>
            </div>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              Active Link
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-zinc-200 text-xs font-mono text-zinc-700">
            <span className="truncate">{booking.meetingLink}</span>
            <button
              onClick={handleCopyLink}
              className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 transition-colors shrink-0"
              title="Copy Meeting URL"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <a
            href={booking.meetingLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <span>Launch Video Room</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Actions bar */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => setIsReceiptOpen(true)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-zinc-300"
          >
            <FileText className="w-4 h-4 text-zinc-600" />
            <span>Download / Print Receipt</span>
          </button>

          <button
            onClick={() => onNavigate('/')}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Back to Mentors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Official Printable Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        booking={booking}
      />
    </div>
  );
};

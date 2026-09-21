import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Booking, TimeSlot } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  Calendar,
  Clock,
  Video,
  FileText,
  RotateCcw,
  XCircle,
  Star,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Plus,
} from 'lucide-react';

interface DashboardProps {
  onNavigate: (path: string) => void;
}

export const UserDashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [past, setPast] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedBookingForReceipt, setSelectedBookingForReceipt] = useState<Booking | null>(null);
  const [rescheduleBookingTarget, setRescheduleBookingTarget] = useState<Booking | null>(null);
  const [cancelBookingTarget, setCancelBookingTarget] = useState<Booking | null>(null);
  const [reviewBookingTarget, setReviewBookingTarget] = useState<Booking | null>(null);

  // Reschedule form state
  const [newDate, setNewDate] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState<TimeSlot[]>([]);
  const [selectedNewSlot, setSelectedNewSlot] = useState<TimeSlot | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Cancel form state
  const [cancelReason, setCancelReason] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<{
        success: boolean;
        data: { upcoming: Booking[]; past: Booking[] };
      }>('/bookings/user/all');
      setUpcoming(res.data.upcoming);
      setPast(res.data.past);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReschedule = async (booking: Booking) => {
    setRescheduleBookingTarget(booking);
    setRescheduleError(null);
    setSelectedNewSlot(null);

    // Default to 2 days ahead
    const d = new Date();
    d.setDate(d.getDate() + 2);
    const dateStr = d.toISOString().split('T')[0];
    setNewDate(dateStr);
    fetchRescheduleSlots(booking.consultantId._id, dateStr);
  };

  const fetchRescheduleSlots = async (consultantId: string, dateStr: string) => {
    try {
      const res = await apiRequest<{ success: boolean; slots: TimeSlot[] }>(
        `/consultants/${consultantId}/slots?date=${dateStr}`
      );
      setRescheduleSlots(res.slots);
    } catch (e) {
      console.error(e);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleBookingTarget || !selectedNewSlot || !newDate) return;
    setRescheduleLoading(true);
    setRescheduleError(null);

    try {
      await apiRequest(`/bookings/${rescheduleBookingTarget._id}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({
          newDate,
          newStartTime: selectedNewSlot.startTime,
          reason: rescheduleReason,
        }),
      });

      setRescheduleBookingTarget(null);
      fetchBookings();
    } catch (err: any) {
      setRescheduleError(err.message || 'Rescheduling failed.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!cancelBookingTarget) return;
    setCancelLoading(true);
    setCancelError(null);

    try {
      await apiRequest(`/bookings/${cancelBookingTarget._id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: cancelReason }),
      });

      setCancelBookingTarget(null);
      fetchBookings();
    } catch (err: any) {
      setCancelError(err.message || 'Cancellation failed.');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewBookingTarget) return;
    setReviewLoading(true);
    try {
      await apiRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          consultantId: reviewBookingTarget.consultantId._id,
          bookingId: reviewBookingTarget._id,
          rating,
          comment,
        }),
      });

      setReviewBookingTarget(null);
      setComment('');
      alert('Thank you! Your verified review has been published.');
    } catch (err: any) {
      alert(err.message || 'Review submission failed.');
    } finally {
      setReviewLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-10 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Client Portal</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Welcome back, {user?.name}. Manage your scheduled consultations and verified receipts.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/consultants')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Consultation</span>
        </button>
      </div>

      {/* Upcoming Consultations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            Upcoming Consultations ({upcoming.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500">Loading your schedule...</div>
        ) : upcoming.length === 0 ? (
          <div className="p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center space-y-3">
            <p className="text-xs text-zinc-400">You have no upcoming consultations scheduled.</p>
            <button
              onClick={() => onNavigate('/consultants')}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
            >
              Browse Available Mentors
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {upcoming.map((b) => (
              <div
                key={b._id}
                className="p-6 rounded-3xl bg-zinc-900/80 border border-zinc-800/90 shadow-xl space-y-5 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={b.consultantId?.avatar}
                        alt={b.consultantId?.name}
                        className="w-12 h-12 rounded-xl object-cover border border-zinc-700/60"
                      />
                      <div>
                        <h3 className="font-bold text-white text-sm">{b.consultantId?.name}</h3>
                        <p className="text-xs text-emerald-400 font-medium">
                          {b.consultantId?.domain}
                        </p>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                      Confirmed
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
                      <span className="text-zinc-500 text-[10px] block">Date</span>
                      <span className="font-semibold text-zinc-200">{b.date}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/70">
                      <span className="text-zinc-500 text-[10px] block">Time Slot</span>
                      <span className="font-semibold text-zinc-200">
                        {b.startTime} – {b.endTime}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/60">
                  <a
                    href={b.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/10"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Video Call</span>
                  </a>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <button
                      onClick={() => setSelectedBookingForReceipt(b)}
                      className="py-1.5 px-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Receipt</span>
                    </button>

                    <button
                      onClick={() => handleOpenReschedule(b)}
                      className="py-1.5 px-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reschedule</span>
                    </button>

                    <button
                      onClick={() => {
                        setCancelBookingTarget(b);
                        setCancelError(null);
                      }}
                      className="py-1.5 px-2 rounded-lg bg-red-950/20 hover:bg-red-950/40 text-red-400 font-medium transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Consultations */}
      <div className="space-y-4 pt-6 border-t border-zinc-800/80">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-400" />
          Past & Completed Consultations ({past.length})
        </h2>

        {past.length === 0 ? (
          <p className="text-xs text-zinc-500">No past sessions recorded.</p>
        ) : (
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 overflow-hidden">
            <div className="divide-y divide-zinc-800/60">
              {past.map((b) => (
                <div
                  key={b._id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-900 transition-colors text-xs"
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={b.consultantId?.avatar}
                      alt={b.consultantId?.name}
                      className="w-10 h-10 rounded-xl object-cover border border-zinc-700/60"
                    />
                    <div>
                      <span className="font-bold text-white block">{b.consultantId?.name}</span>
                      <span className="text-zinc-400 text-[11px]">
                        {b.date} • {b.startTime} – {b.endTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        b.status === 'CANCELLED'
                          ? 'bg-red-950 text-red-400 border border-red-800/60'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {b.status}
                    </span>

                    <button
                      onClick={() => setSelectedBookingForReceipt(b)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium"
                    >
                      Receipt
                    </button>

                    {b.status !== 'CANCELLED' && (
                      <button
                        onClick={() => setReviewBookingTarget(b)}
                        className="px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-950/60 text-amber-300 border border-amber-800/50 font-medium flex items-center gap-1"
                      >
                        <Star className="w-3 h-3 fill-amber-300" />
                        <span>Leave Review</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      {rescheduleBookingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div>
              <h3 className="text-lg font-bold text-white">Reschedule Consultation</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Moving session with {rescheduleBookingTarget.consultantId?.name}
              </p>
            </div>

            {rescheduleError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{rescheduleError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Select New Date (must meet 24h notice)
                </label>
                <input
                  type="date"
                  value={newDate}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  onChange={(e) => {
                    setNewDate(e.target.value);
                    fetchRescheduleSlots(rescheduleBookingTarget.consultantId._id, e.target.value);
                  }}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Choose Available Slot
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 text-xs">
                  {rescheduleSlots
                    .filter((s) => s.status === 'Available')
                    .map((s) => (
                      <button
                        key={s.startTime}
                        type="button"
                        onClick={() => setSelectedNewSlot(s)}
                        className={`p-2 rounded-lg border text-center font-medium transition-all ${
                          selectedNewSlot?.startTime === s.startTime
                            ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                            : 'border-zinc-800 bg-zinc-950/60 hover:bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {s.startTime}
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Reason for Rescheduling
                </label>
                <input
                  type="text"
                  placeholder="e.g. Schedule conflict"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleBookingTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedNewSlot || rescheduleLoading}
                onClick={handleConfirmReschedule}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs disabled:opacity-50 transition-all shadow-md shadow-emerald-500/20"
              >
                {rescheduleLoading ? 'Updating Schedule...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancelBookingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Cancel Appointment?</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Are you sure you want to cancel your session on{' '}
              <strong className="text-zinc-200">
                {cancelBookingTarget.date} at {cancelBookingTarget.startTime}
              </strong>
              ? Note that cancellations are permitted up to 12 hours prior to the slot.
            </p>

            {cancelError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
                {cancelError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Reason</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Optional explanation..."
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setCancelBookingTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Keep Booking
              </button>
              <button
                disabled={cancelLoading}
                onClick={handleConfirmCancel}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs disabled:opacity-50 transition-colors"
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewBookingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              Review your session with {reviewBookingTarget.consultantId?.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setRating(num)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          num <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Feedback</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share how the consultation helped your technical problem or roadmap..."
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-3 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setReviewBookingTarget(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Dismiss
              </button>
              <button
                disabled={reviewLoading || comment.length < 5}
                onClick={handleSubmitReview}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs disabled:opacity-50 transition-all"
              >
                {reviewLoading ? 'Submitting...' : 'Post Verified Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {selectedBookingForReceipt && (
        <ReceiptModal
          isOpen={!!selectedBookingForReceipt}
          onClose={() => setSelectedBookingForReceipt(null)}
          booking={selectedBookingForReceipt}
        />
      )}
    </div>
  );
};

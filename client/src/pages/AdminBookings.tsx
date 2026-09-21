import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { Booking, TimeSlot } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Clock,
  RotateCcw,
  XCircle,
  Video,
  ChevronLeft,
  AlertCircle,
  User,
} from 'lucide-react';

interface AdminBookingsProps {
  onNavigate: (path: string) => void;
}

export const AdminBookings: React.FC<AdminBookingsProps> = ({ onNavigate }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected receipt
  const [selectedReceiptBooking, setSelectedReceiptBooking] = useState<Booking | null>(null);

  // Admin Reschedule modal
  const [targetRescheduleBooking, setTargetRescheduleBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState('Rescheduled by Admin');
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  // Admin Cancel modal
  const [targetCancelBooking, setTargetCancelBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState('Cancelled by Admin');
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, searchQuery]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await apiRequest<{ success: boolean; data: Booking[] }>(
        `/admin/bookings?${params.toString()}`
      );
      setBookings(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReschedule = async (b: Booking) => {
    setTargetRescheduleBooking(b);
    setRescheduleError(null);
    setSelectedSlot(null);

    const d = new Date();
    d.setDate(d.getDate() + 2);
    const dateStr = d.toISOString().split('T')[0];
    setNewDate(dateStr);

    const consultantId = typeof b.consultantId === 'object' ? b.consultantId._id : b.consultantId;
    try {
      const res = await apiRequest<{ success: boolean; slots: TimeSlot[] }>(
        `/consultants/${consultantId}/slots?date=${dateStr}`
      );
      setRescheduleSlots(res.slots);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDateChange = async (dateStr: string) => {
    setNewDate(dateStr);
    setSelectedSlot(null);
    if (!targetRescheduleBooking) return;
    const consultantId =
      typeof targetRescheduleBooking.consultantId === 'object'
        ? targetRescheduleBooking.consultantId._id
        : targetRescheduleBooking.consultantId;

    try {
      const res = await apiRequest<{ success: boolean; slots: TimeSlot[] }>(
        `/consultants/${consultantId}/slots?date=${dateStr}`
      );
      setRescheduleSlots(res.slots);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmReschedule = async () => {
    if (!targetRescheduleBooking || !selectedSlot || !newDate) return;
    setRescheduleLoading(true);
    setRescheduleError(null);

    try {
      await apiRequest(`/admin/bookings/${targetRescheduleBooking._id}/reschedule`, {
        method: 'POST',
        body: JSON.stringify({
          newDate,
          newStartTime: selectedSlot.startTime,
          reason: rescheduleReason,
        }),
      });

      setTargetRescheduleBooking(null);
      fetchBookings();
    } catch (err: any) {
      setRescheduleError(err.message || 'Rescheduling failed.');
    } finally {
      setRescheduleLoading(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!targetCancelBooking) return;
    setCancelLoading(true);
    try {
      await apiRequest(`/admin/bookings/${targetCancelBooking._id}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason: cancelReason }),
      });

      setTargetCancelBooking(null);
      fetchBookings();
    } catch (err: any) {
      alert(err.message || 'Cancellation failed.');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <button
            onClick={() => onNavigate('/admin')}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Admin Overview
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">All Bookings & Appointments</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Complete audit ledger of customer sessions, payment states, and admin overrides.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by customer, consultant, or receipt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 text-xs overflow-x-auto w-full sm:w-auto">
          {['', 'CONFIRMED', 'PENDING_PAYMENT', 'CANCELLED', 'RESCHEDULED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-colors ${
                statusFilter === st
                  ? 'bg-emerald-500 text-zinc-950 font-bold'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
              }`}
            >
              {st === '' ? 'All Statuses' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Ledger */}
      <div className="rounded-3xl border border-zinc-800/90 bg-zinc-900 overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-500">Loading bookings ledger...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500">No bookings match your filter.</div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {bookings.map((b: any) => (
              <div
                key={b._id}
                className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-zinc-850 transition-colors text-xs"
              >
                {/* Customer & Consultant */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{b.userId?.name || 'Client'}</span>
                    <span className="text-zinc-400">with</span>
                    <span className="font-semibold text-emerald-400">
                      {b.consultantId?.name || 'Mentor'}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px]">
                    {b.userId?.email} • {b.userId?.phone}
                  </p>
                  {b.customerNotes && (
                    <p className="text-zinc-500 italic text-[11px] pt-1">Notes: "{b.customerNotes}"</p>
                  )}
                </div>

                {/* Date & Time */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono font-medium text-zinc-300">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{b.date}</span>
                    <span>•</span>
                    <span>
                      {b.startTime} – {b.endTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-zinc-500">Receipt:</span>
                    <span className="font-mono text-zinc-300">{b.receiptId || 'PENDING'}</span>
                    <span className="text-zinc-500">•</span>
                    <span className="font-semibold text-emerald-400">₹{b.amount}</span>
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      b.status === 'CONFIRMED'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                        : b.status === 'CANCELLED'
                        ? 'bg-red-950 text-red-400 border border-red-800/60'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {b.status}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                      b.paymentStatus === 'PAID'
                        ? 'bg-emerald-950 text-emerald-400'
                        : b.paymentStatus === 'REFUNDED'
                        ? 'bg-amber-950 text-amber-400'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {b.paymentStatus}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {b.status === 'CONFIRMED' && (
                    <>
                      <button
                        onClick={() => handleOpenReschedule(b)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1 transition-colors"
                        title="Reschedule Appointment"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reschedule</span>
                      </button>

                      <button
                        onClick={() => setTargetCancelBooking(b)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-950/50 text-red-400 text-xs font-medium flex items-center gap-1 transition-colors"
                        title="Cancel Booking"
                      >
                        <XCircle className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setSelectedReceiptBooking(b)}
                    className="px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium flex items-center gap-1"
                  >
                    <FileText className="w-3 h-3 text-zinc-400" />
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin Reschedule Modal */}
      {targetRescheduleBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Admin Reschedule Override</h3>
            <p className="text-xs text-zinc-400">
              Moving customer{' '}
              <strong className="text-white">
                {(targetRescheduleBooking.userId as any)?.name}
              </strong>
            </p>

            {rescheduleError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs">
                {rescheduleError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Select New Date
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  Available Slots
                </label>
                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1 text-xs">
                  {rescheduleSlots
                    .filter((s) => s.status === 'Available')
                    .map((s) => (
                      <button
                        key={s.startTime}
                        type="button"
                        onClick={() => setSelectedSlot(s)}
                        className={`p-2 rounded-lg border text-center font-medium transition-all ${
                          selectedSlot?.startTime === s.startTime
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
                  Administrative Reason
                </label>
                <input
                  type="text"
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setTargetRescheduleBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Dismiss
              </button>
              <button
                disabled={!selectedSlot || rescheduleLoading}
                onClick={handleConfirmReschedule}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs disabled:opacity-50 transition-all"
              >
                {rescheduleLoading ? 'Updating...' : 'Confirm Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Cancel Modal */}
      {targetCancelBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Cancel Booking (Admin Override)</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This will update the booking to <strong className="text-red-400">CANCELLED</strong> and
              the payment status to <strong className="text-amber-400">REFUNDED</strong>.
            </p>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Reason</label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setTargetCancelBooking(null)}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Close
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

      {/* Receipt Modal */}
      {selectedReceiptBooking && (
        <ReceiptModal
          isOpen={!!selectedReceiptBooking}
          onClose={() => setSelectedReceiptBooking(null)}
          booking={selectedReceiptBooking}
        />
      )}
    </div>
  );
};

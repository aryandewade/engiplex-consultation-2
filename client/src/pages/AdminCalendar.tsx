import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { Consultant, TimeSlot } from '../types';
import {
  Calendar,
  Clock,
  Shield,
  Ban,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  RotateCcw,
  XCircle,
  ChevronLeft,
} from 'lucide-react';

interface AdminCalendarProps {
  onNavigate: (path: string) => void;
}

export const AdminCalendar: React.FC<AdminCalendarProps> = ({ onNavigate }) => {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [selectedConsultantId, setSelectedConsultantId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Slot blocking modal
  const [blockingSlot, setBlockingSlot] = useState<any | null>(null);
  const [blockReason, setBlockReason] = useState('Personal appointment');
  const [isFullDay, setIsFullDay] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);

  // Conflict state from backend
  const [conflictData, setConflictData] = useState<any | null>(null);

  useEffect(() => {
    fetchConsultants();
  }, []);

  useEffect(() => {
    if (selectedConsultantId && selectedDate) {
      fetchDaySchedule();
    }
  }, [selectedConsultantId, selectedDate]);

  const fetchConsultants = async () => {
    try {
      const res = await apiRequest<{ success: boolean; data: Consultant[] }>('/consultants');
      setConsultants(res.data);
      if (res.data.length > 0 && !selectedConsultantId) {
        setSelectedConsultantId(res.data[0]._id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchDaySchedule = async () => {
    setLoading(true);
    setConflictData(null);
    try {
      const res = await apiRequest<{ success: boolean; schedule: any[] }>(
        `/admin/today?consultantId=${selectedConsultantId}&date=${selectedDate}`
      );
      if (res.schedule && res.schedule.length > 0) {
        setSlots(res.schedule[0].slots);
      } else {
        setSlots([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockSlot = async () => {
    if (!selectedConsultantId || !selectedDate) return;
    setBlockLoading(true);
    setConflictData(null);

    try {
      await apiRequest('/admin/block-slot', {
        method: 'POST',
        body: JSON.stringify({
          consultantId: selectedConsultantId,
          date: selectedDate,
          startTime: isFullDay ? undefined : blockingSlot?.startTime,
          isFullDay,
          reason: blockReason,
        }),
      });

      setBlockingSlot(null);
      fetchDaySchedule();
    } catch (err: any) {
      if (err.status === 409 && err.data?.hasConflict) {
        // Active booking exists: surface conflict guard!
        setConflictData(err.data);
      } else {
        alert(err.message || 'Failed to block slot.');
      }
    } finally {
      setBlockLoading(false);
    }
  };

  const handleUnblockSlot = async (blockId: string) => {
    if (!blockId) return;
    try {
      await apiRequest(`/admin/block-slot/${blockId}`, { method: 'DELETE' });
      fetchDaySchedule();
    } catch (e: any) {
      alert(e.message || 'Failed to unblock slot.');
    }
  };

  const selectedConsultant = consultants.find((c) => c._id === selectedConsultantId);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <button
            onClick={() => onNavigate('/admin')}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white mb-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Admin Overview
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Consultant Calendar & Availability Manager
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Configure hourly slot availability, block specific hours, or record out-of-office holidays.
          </p>
        </div>

        {/* Action: Block entire day */}
        <button
          onClick={() => {
            setIsFullDay(true);
            setBlockingSlot({ startTime: 'All Day' });
            setBlockReason('Holiday / Out of Office');
          }}
          className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
        >
          <Ban className="w-3.5 h-3.5 text-amber-400" />
          <span>Mark Entire Day Off</span>
        </button>
      </div>

      {/* Selector Bar */}
      <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800/90 shadow-xl flex flex-col sm:flex-row items-center gap-4 justify-between">
        {/* Consultant Selector */}
        <div className="w-full sm:w-80">
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
            Select Consultant
          </label>
          <select
            value={selectedConsultantId}
            onChange={(e) => setSelectedConsultantId(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
          >
            {consultants.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.domain})
              </option>
            ))}
          </select>
        </div>

        {/* Date Selector */}
        <div className="w-full sm:w-60">
          <label className="block text-xs font-semibold text-zinc-400 mb-1.5">
            Select Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Slots Table */}
      <div className="rounded-3xl border border-zinc-800/90 bg-zinc-900 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedConsultant && (
              <img
                src={selectedConsultant.avatar}
                alt={selectedConsultant.name}
                className="w-10 h-10 rounded-xl object-cover border border-zinc-700"
              />
            )}
            <div>
              <h2 className="text-base font-bold text-white">
                {selectedConsultant?.name} — {selectedDate}
              </h2>
              <p className="text-xs text-emerald-400">{selectedConsultant?.domain}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-zinc-500">Loading schedule...</div>
        ) : slots.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-500">
            No schedule found for this date.
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/70">
            {slots.map((s) => (
              <div
                key={s.startTime}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-zinc-800/30 transition-colors text-xs"
              >
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-zinc-300 w-28">
                    {s.startTime} – {s.endTime}
                  </span>

                  {s.status === 'Booked' ? (
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{s.booking?.customerName}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-full font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60 uppercase">
                          Confirmed Booking
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400">
                        {s.booking?.customerEmail} • {s.booking?.customerPhone}
                      </p>
                    </div>
                  ) : s.status === 'Unavailable' ? (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                        Blocked
                      </span>
                      <span>{s.reason || 'Marked unavailable by administrator'}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Available for Customer Booking</span>
                    </div>
                  )}
                </div>

                {/* Right Action */}
                <div>
                  {s.status === 'Available' && (
                    <button
                      onClick={() => {
                        setIsFullDay(false);
                        setBlockingSlot(s);
                        setBlockReason('Personal appointment');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Mark Unavailable</span>
                    </button>
                  )}

                  {s.status === 'Unavailable' && s.blockId && (
                    <button
                      onClick={() => handleUnblockSlot(s.blockId)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-emerald-950 hover:text-emerald-300 text-zinc-400 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Unblock Slot</span>
                    </button>
                  )}

                  {s.status === 'Booked' && (
                    <button
                      onClick={() => onNavigate('/admin/bookings')}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs"
                    >
                      Manage Customer Booking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Block Slot Modal */}
      {blockingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <h3 className="text-lg font-bold text-white">
              {isFullDay ? 'Mark Entire Day Off' : `Block Slot: ${blockingSlot.startTime}`}
            </h3>
            <p className="text-xs text-zinc-400">
              For {selectedConsultant?.name} on {selectedDate}
            </p>

            {/* CRITICAL CONFLICT WARNING FROM BACKEND */}
            {conflictData && (
              <div className="p-4 rounded-2xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Existing Booking Detected!</span>
                </div>
                <p className="leading-relaxed">
                  The system blocked this action because there is already an active customer appointment:
                </p>
                {conflictData.conflictBookings?.map((cb: any) => (
                  <div key={cb.id} className="bg-zinc-950/80 p-3 rounded-xl border border-zinc-800 space-y-1">
                    <p className="font-bold text-white">{cb.customerName}</p>
                    <p className="text-zinc-400">{cb.customerEmail} • {cb.customerPhone}</p>
                    <p className="text-emerald-400 font-semibold">{cb.date} at {cb.startTime} – {cb.endTime}</p>
                  </div>
                ))}
                <p className="text-[11px] text-amber-300/90 font-medium">
                  To protect the customer, please reschedule or cancel their appointment first from the All Bookings tab.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => {
                      setBlockingSlot(null);
                      onNavigate('/admin/bookings');
                    }}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs"
                  >
                    Go to Bookings to Reschedule / Cancel
                  </button>
                </div>
              </div>
            )}

            {!conflictData && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1">
                    Reason for Unavailability
                  </label>
                  <input
                    type="text"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="e.g. Personal appointment, Doctor visit, Holiday"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setBlockingSlot(null);
                  setConflictData(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Close
              </button>
              {!conflictData && (
                <button
                  disabled={blockLoading || !blockReason}
                  onClick={handleBlockSlot}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs disabled:opacity-50 transition-all"
                >
                  {blockLoading ? 'Checking Conflicts...' : 'Save & Block Slot'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

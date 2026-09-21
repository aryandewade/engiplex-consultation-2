import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import {
  Calendar as CalendarIcon,
  Clock,
  TrendingUp,
  Users,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Video,
  FileText,
  Mail,
  Sliders,
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchSchedule(selectedDate);
  }, [selectedDate]);

  const fetchStats = async () => {
    try {
      const res = await apiRequest<{ success: boolean; data: any }>('/admin/stats');
      setStats(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchSchedule = async (dateStr: string) => {
    setLoadingSchedule(true);
    try {
      const res = await apiRequest<{ success: boolean; schedule: any[] }>(
        `/admin/today?date=${dateStr}`
      );
      setScheduleData(res.schedule);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSchedule(false);
    }
  };

  const handleDateShift = (deltaDays: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + deltaDays);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in">
      {/* Top Admin Sub-Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Admin Command Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            Organization Schedule & Hub
          </h1>
        </div>

        {/* Quick Admin Links */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => onNavigate('/admin/calendar')}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 transition-colors flex items-center gap-1.5 font-medium"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Manage Slots</span>
          </button>
          <button
            onClick={() => onNavigate('/admin/consultants')}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 transition-colors flex items-center gap-1.5 font-medium"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Consultants</span>
          </button>
          <button
            onClick={() => onNavigate('/admin/bookings')}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 transition-colors flex items-center gap-1.5 font-medium"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span>All Bookings</span>
          </button>
          <button
            onClick={() => onNavigate('/admin/emails')}
            className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 transition-colors flex items-center gap-1.5 font-medium"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-400" />
            <span>Email Log</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 shadow space-y-1">
          <span className="text-zinc-400 text-xs font-medium">Today’s Bookings</span>
          <p className="text-2xl sm:text-3xl font-black text-white">
            {stats?.todayBookings || 0}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 shadow space-y-1">
          <span className="text-zinc-400 text-xs font-medium">Total Revenue</span>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400">
            ₹{stats?.totalRevenue?.toLocaleString() || 0}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 shadow space-y-1">
          <span className="text-zinc-400 text-xs font-medium">Total Confirmed</span>
          <p className="text-2xl sm:text-3xl font-black text-white">
            {stats?.totalBookings || 0}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 shadow space-y-1">
          <span className="text-zinc-400 text-xs font-medium">Active Mentors</span>
          <p className="text-2xl sm:text-3xl font-black text-white">
            {stats?.activeConsultants || 0}
          </p>
        </div>
      </div>

      {/* PRIORITIZED SECTION: TODAY'S SCHEDULE */}
      <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800/90 shadow-2xl space-y-6">
        {/* Date Selector Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {isToday ? "Today's Schedule & Consultations" : `Schedule for ${selectedDate}`}
              </h2>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live hourly timeline across all active organization mentors
            </p>
          </div>

          <div className="flex items-center gap-2 bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
            <button
              onClick={() => handleDateShift(-1)}
              className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-zinc-200 font-semibold px-2 focus:outline-none"
            />

            <button
              onClick={() => handleDateShift(1)}
              className="p-1.5 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {!isToday && (
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-2.5 py-1 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-[11px] ml-1"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Schedule List */}
        {loadingSchedule ? (
          <div className="py-12 text-center text-xs text-zinc-400">Loading day schedule...</div>
        ) : scheduleData.length === 0 ? (
          <div className="py-12 text-center text-xs text-zinc-500">
            No active mentors found for this organization.
          </div>
        ) : (
          <div className="space-y-6">
            {scheduleData.map((group) => (
              <div
                key={group.consultant.id}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-950/60 overflow-hidden"
              >
                {/* Consultant Header */}
                <div className="px-5 py-3.5 bg-zinc-900/80 border-b border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={group.consultant.avatar}
                      alt={group.consultant.name}
                      className="w-8 h-8 rounded-lg object-cover border border-zinc-700/60"
                    />
                    <div>
                      <span className="font-bold text-white text-xs block">
                        {group.consultant.name}
                      </span>
                      <span className="text-[11px] text-emerald-400">{group.consultant.domain}</span>
                    </div>
                  </div>

                  <span className="text-xs text-zinc-400">
                    {group.slots.filter((s: any) => s.status === 'Booked').length} Booked Today
                  </span>
                </div>

                {/* Slots Grid */}
                <div className="divide-y divide-zinc-800/50">
                  {group.slots.map((s: any) => (
                    <div
                      key={s.startTime}
                      className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-zinc-900/40 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="font-mono font-semibold text-zinc-300 w-24">
                          {s.startTime} – {s.endTime}
                        </span>

                        {s.status === 'Booked' ? (
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">
                                {s.booking?.customerName}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 uppercase font-semibold">
                                Confirmed & Paid
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400">
                              {s.booking?.customerEmail} • {s.booking?.customerPhone}
                            </p>
                          </div>
                        ) : s.status === 'Unavailable' ? (
                          <div className="flex items-center gap-2 text-zinc-500">
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-500 border border-zinc-800">
                              Unavailable
                            </span>
                            <span>{s.reason || 'Blocked'}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-600 italic">No booking scheduled</span>
                        )}
                      </div>

                      {/* Right Action */}
                      <div>
                        {s.status === 'Booked' ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={s.booking?.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-[11px] flex items-center gap-1"
                            >
                              <Video className="w-3 h-3 text-emerald-400" />
                              <span>Join Call</span>
                            </a>
                            <button
                              onClick={() => onNavigate('/admin/bookings')}
                              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px]"
                            >
                              Manage
                            </button>
                          </div>
                        ) : s.status === 'Available' ? (
                          <span className="text-[10px] uppercase font-semibold text-emerald-400/80">
                            Slot Open
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

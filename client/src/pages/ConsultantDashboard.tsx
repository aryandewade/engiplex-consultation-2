import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  Clock,
  Video,
  User,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  GraduationCap,
  Sparkles,
  Phone,
  Mail,
  FileText,
  Copy,
  Check,
  RefreshCw,
  Search,
  Star,
  Users,
} from 'lucide-react';

interface ConsultantDashboardProps {
  onNavigate: (path: string) => void;
}

interface ClientUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
}

interface ConsultantBooking {
  _id: string;
  userId: ClientUser;
  consultantId: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';
  paymentStatus: 'CREATED' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  amount: number;
  promoCode?: string;
  isStudentOrFresher?: boolean;
  collegeName?: string;
  graduationYear?: number;
  receiptId?: string;
  meetingLink: string;
  customerNotes?: string;
  createdAt: string;
}

interface ConsultantProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  domain: string;
  bio: string;
  skills: string[];
  rating: number;
  reviewCount: number;
  fee: number;
  workingHours: {
    start: string;
    end: string;
  };
}

interface DashboardStats {
  totalBookings: number;
  todayCount: number;
  upcomingCount: number;
  completedCount: number;
  cancelledCount: number;
  studentSessions: number;
  totalEarnings: number;
}

export const ConsultantDashboard: React.FC<ConsultantDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ConsultantProfileData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<{
    today: ConsultantBooking[];
    upcoming: ConsultantBooking[];
    completed: ConsultantBooking[];
    cancelled: ConsultantBooking[];
    all: ConsultantBooking[];
  }>({
    today: [],
    upcoming: [],
    completed: [],
    cancelled: [],
    all: [],
  });

  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed' | 'all'>('upcoming');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const fetchDashboardData = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await apiRequest<{
        success: boolean;
        data: {
          consultant: ConsultantProfileData;
          stats: DashboardStats;
          bookings: {
            today: ConsultantBooking[];
            upcoming: ConsultantBooking[];
            completed: ConsultantBooking[];
            cancelled: ConsultantBooking[];
            all: ConsultantBooking[];
          };
        };
      }>('/consultant-portal/bookings');

      if (res.success && res.data) {
        setProfile(res.data.consultant);
        setStats(res.data.stats);
        setBookings(res.data.bookings);

        // Auto-select 'today' tab if there are bookings today
        if (res.data.bookings.today.length > 0 && !isManualRefresh) {
          setActiveTab('today');
        }
      }
    } catch (error) {
      console.error('Failed to load consultant portal data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleMarkCompleted = async (bookingId: string) => {
    setCompletingId(bookingId);
    try {
      const res = await apiRequest<{ success: boolean; message: string; data: ConsultantBooking }>(
        `/consultant-portal/bookings/${bookingId}/complete`,
        { method: 'PUT' }
      );

      if (res.success) {
        await fetchDashboardData(true);
      }
    } catch (error) {
      console.error('Failed to mark booking completed:', error);
    } finally {
      setCompletingId(null);
    }
  };

  const copyMeetingLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getDisplayedBookings = () => {
    let list: ConsultantBooking[] = [];
    if (selectedDate) {
      list = bookings.all.filter((b) => b.date === selectedDate);
    } else if (activeTab === 'today') {
      list = bookings.today;
    } else if (activeTab === 'upcoming') {
      list = bookings.upcoming;
    } else if (activeTab === 'completed') {
      list = bookings.completed;
    } else {
      list = bookings.all;
    }

    if (!searchFilter.trim()) return list;

    const q = searchFilter.toLowerCase().trim();
    return list.filter(
      (b) =>
        b.userId?.name?.toLowerCase().includes(q) ||
        b.userId?.email?.toLowerCase().includes(q) ||
        b.customerNotes?.toLowerCase().includes(q) ||
        b.collegeName?.toLowerCase().includes(q) ||
        b.date.includes(q)
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-20 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-zinc-400 text-sm">Loading your mentor dashboard...</p>
      </div>
    );
  }

  const displayedList = getDisplayedBookings();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-10 animate-fade-in">
      {/* Consultant Profile Banner */}
      <section className="relative glass-panel rounded-3xl p-6 sm:p-10 border border-zinc-800/80 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <img
              src={profile?.avatar || user?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80'}
              alt={profile?.name || 'Mentor'}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-emerald-500/40 shadow-xl"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {profile?.name || user?.name}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 shadow-sm">
                  <Sparkles className="w-3 h-3" />
                  Advisor Portal
                </span>
              </div>

              <p className="text-sm font-medium text-emerald-400">
                {profile?.domain || 'Engineering Consultant'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <strong className="text-zinc-200">{profile?.rating || 4.9}</strong> ({profile?.reviewCount || 48} reviews)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Evening Slots: <strong className="text-zinc-200">{profile?.workingHours?.start || '19:00'} – {profile?.workingHours?.end || '21:00'}</strong> (20m sessions)</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 flex items-center gap-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
              <span>Refresh</span>
            </button>

            {profile?.id && (
              <button
                onClick={() => onNavigate(`/consultants/${profile.id}`)}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <span>View Public Booking Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={() => {
                localStorage.removeItem('consultflow_token');
                localStorage.removeItem('consultflow_user');
                window.location.href = '/login';
              }}
              className="px-4 py-2.5 rounded-xl border border-red-900/60 bg-red-950/40 hover:bg-red-900/50 text-xs font-semibold text-red-300 transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="glass-card spotlight-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Today's Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {stats?.todayCount || 0}
          </div>
          <span className="text-[11px] text-zinc-500 block">
            {stats?.todayCount ? 'Sessions scheduled for today' : 'No sessions today'}
          </span>
        </div>

        <div className="glass-card spotlight-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Upcoming Appointments</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {stats?.upcomingCount || 0}
          </div>
          <span className="text-[11px] text-zinc-500 block">Future confirmed slots</span>
        </div>

        <div className="glass-card spotlight-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Completed Sessions</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {stats?.completedCount || 0}
          </div>
          <span className="text-[11px] text-zinc-500 block">Successfully delivered</span>
        </div>

        <div className="glass-card spotlight-border rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400 text-xs">
            <span>Students & Freshers</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white tabular-nums">
            {stats?.studentSessions || 0}
          </div>
          <span className="text-[11px] text-zinc-500 block">Student fee waiver sessions</span>
        </div>
      </section>

      {/* Bookings Explorer */}
      <section className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-zinc-950 p-1.5 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => {
                setSelectedDate('');
                setActiveTab('today');
              }}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                !selectedDate && activeTab === 'today'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/80 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Today's Sessions</span>
              {bookings.today.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500 text-zinc-950 font-bold">
                  {bookings.today.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setSelectedDate('');
                setActiveTab('upcoming');
              }}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                !selectedDate && activeTab === 'upcoming'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Upcoming</span>
              {bookings.upcoming.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-700 text-zinc-200 font-bold">
                  {bookings.upcoming.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setSelectedDate('');
                setActiveTab('completed');
              }}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
                !selectedDate && activeTab === 'completed'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Completed</span>
              <span className="text-zinc-500 font-normal">({bookings.completed.length})</span>
            </button>

            <button
              onClick={() => {
                setSelectedDate('');
                setActiveTab('all');
              }}
              className={`px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                !selectedDate && activeTab === 'all'
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>All Day History ({bookings.all.length})</span>
            </button>
          </div>

          {/* Date Picker & Search bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Filter by Specific Day */}
            <div className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-800 rounded-xl px-2.5 py-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs text-zinc-200 focus:outline-none cursor-pointer"
                title="Filter by Specific Date"
              />
              {selectedDate && (
                <button
                  onClick={() => setSelectedDate('')}
                  className="text-[10px] text-zinc-400 hover:text-white px-1 font-bold"
                  title="Clear Date"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search client, email..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {displayedList.length === 0 ? (
          <div className="glass-card rounded-3xl p-12 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-base font-bold text-white">
                {activeTab === 'today'
                  ? 'No sessions scheduled for today'
                  : activeTab === 'upcoming'
                  ? 'No upcoming bookings found'
                  : 'No appointments in this category'}
              </h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                When clients book consultation slots on your profile, they will appear here with contact details, resume goals, and direct video links.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {displayedList.map((booking) => {
              const isToday = booking.date === new Date().toISOString().split('T')[0];
              const isCompleted = booking.status === 'COMPLETED';
              const isCancelled = booking.status === 'CANCELLED';

              return (
                <div
                  key={booking._id}
                  className={`glass-card spotlight-border rounded-2xl p-5 sm:p-6 transition-all space-y-5 ${
                    isToday ? 'border-emerald-500/50 bg-emerald-950/10' : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Client & Date Information */}
                    <div className="flex items-start gap-4">
                      <img
                        src={
                          booking.userId?.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                            booking.userId?.name || 'client'
                          )}`
                        }
                        alt={booking.userId?.name || 'Client'}
                        className="w-12 h-12 rounded-xl object-cover bg-zinc-800 border border-zinc-700"
                      />

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-display text-base font-bold text-white">
                            {booking.userId?.name || 'Client'}
                          </h4>

                          {isToday && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-zinc-950 uppercase tracking-wide animate-pulse">
                              TODAY
                            </span>
                          )}

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              isCompleted
                                ? 'bg-zinc-800 text-zinc-300'
                                : isCancelled
                                ? 'bg-red-950 text-red-400 border border-red-800/50'
                                : 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                            }`}
                          >
                            {booking.status}
                          </span>

                          {booking.isStudentOrFresher ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" />
                              Pay What You Can
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800">
                              Paid ₹{booking.amount}/-
                            </span>
                          )}
                        </div>

                        {/* Contact info */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-zinc-500" />
                            <span>{booking.userId?.email}</span>
                          </span>
                          {booking.userId?.phone && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-zinc-500" />
                                <span>{booking.userId?.phone}</span>
                              </span>
                            </>
                          )}
                          {booking.collegeName && (
                            <>
                              <span>•</span>
                              <span className="text-zinc-300">
                                {booking.collegeName} {booking.graduationYear ? `(${booking.graduationYear})` : ''}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Time Slot Badge & CTA buttons */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800 text-xs">
                        <div className="text-zinc-400 text-[10px]">Date & Time Slot</div>
                        <div className="font-bold text-white tabular-nums flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>
                            {booking.date} • {booking.startTime} – {booking.endTime}
                          </span>
                        </div>
                      </div>

                      {/* Video Call button */}
                      {booking.meetingLink && !isCancelled && (
                        <div className="flex items-center gap-1.5">
                          <a
                            href={booking.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Video Call</span>
                          </a>

                          <button
                            onClick={() => copyMeetingLink(booking.meetingLink, booking._id)}
                            title="Copy Meeting Link"
                            className="p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                          >
                            {copiedId === booking._id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* Complete action */}
                      {!isCompleted && !isCancelled && (
                        <button
                          onClick={() => handleMarkCompleted(booking._id)}
                          disabled={completingId === booking._id}
                          className="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-medium transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400" />
                          <span>{completingId === booking._id ? 'Updating...' : 'Mark Completed'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Client discussion notes */}
                  {booking.customerNotes && (
                    <div className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-start gap-2.5 text-xs">
                      <FileText className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                          Client Notes & Prep Focus:
                        </span>
                        <p className="text-zinc-300 leading-relaxed italic">
                          "{booking.customerNotes}"
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default ConsultantDashboard;

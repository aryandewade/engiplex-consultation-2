import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { Consultant, Review } from '../types';
import {
  Star,
  ShieldCheck,
  Clock,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  User,
  MessageSquare,
} from 'lucide-react';

interface ProfileProps {
  consultantId: string;
  onNavigate: (path: string) => void;
}

export const ConsultantProfile: React.FC<ProfileProps> = ({ consultantId, onNavigate }) => {
  const [consultant, setConsultant] = useState<Consultant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [consultantId]);

  const fetchProfile = async () => {
    try {
      const res = await apiRequest<{ success: boolean; data: Consultant }>(
        `/consultants/${consultantId}`
      );
      setConsultant(res.data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-zinc-400">
        Loading consultant profile...
      </div>
    );
  }

  if (!consultant) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-4">
        <p className="text-zinc-300">Consultant could not be found.</p>
        <button
          onClick={() => onNavigate('/')}
          className="px-4 py-2 rounded-full bg-zinc-800 text-xs font-semibold text-zinc-200"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => onNavigate('/')}
        className="flex items-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 transition-colors font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Home
      </button>

      {/* Main Grid: Details on Left (col-span-8), Booking Card on Right (col-span-4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          {/* Header Card */}
          <div className="p-8 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative inline-block shrink-0">
                <img
                  src={
                    consultant.name.toLowerCase().includes('ashish')
                      ? 'https://media.licdn.com/dms/image/v2/D5603AQHgvioDlx9_IQ/profile-displayphoto-crop_800_800/B56Z6Y4CHeKsAM-/0/1780681286875?e=1790812800&v=beta&t=cNJpjcdLhjrXD9yCIux7_f5gICB2sThInUDzYEbESkI'
                      : consultant.avatar
                  }
                  alt={consultant.name}
                  referrerPolicy="no-referrer"
                  className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl object-cover border-2 border-zinc-200 shadow-md"
                />
                <ShieldCheck
                  className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] pointer-events-none"
                  aria-label="Verified Mentor"
                />
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight">
                    {consultant.name}
                  </h1>
                  {consultant.name.toLowerCase().includes('ashish') && (
                    <a
                      href="https://www.linkedin.com/in/ashish-lichode-b65532221/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold shadow-sm transition-all"
                    >
                      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74V10.13H5.06v8.37h2.8z" />
                      </svg>
                      <span>Connect on LinkedIn</span>
                    </a>
                  )}
                </div>

                <p className="text-sm font-medium text-emerald-700">
                  {consultant.domain === 'Engineering Leader & Career Consultant'
                    ? 'Engineering Consultant'
                    : consultant.domain}
                </p>

                <div className="flex items-center gap-3 text-xs text-zinc-600 pt-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-bold text-zinc-900">{consultant.rating}</span>
                    <span className="text-zinc-500">({consultant.reviewCount} reviews)</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>20 min session</span>
                  </div>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="space-y-3 pt-6 border-t border-zinc-200">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                About the Mentor
              </h2>
              <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-line">
                {consultant.bio}
              </p>
            </div>

            {/* Expertise */}
            <div className="space-y-3 pt-6 border-t border-zinc-200">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Expertise
              </h2>
              <div className="flex flex-wrap gap-2">
                {(consultant.expertise && consultant.expertise.length > 0
                  ? consultant.expertise
                  : [
                      'Career Roadmap',
                      'Resume Strategy',
                      'System Architecture',
                      'Interview Prep',
                      'Talent Mapping',
                      'Project Management',
                    ]
                ).map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-zinc-800 border border-zinc-300 shadow-xs hover:border-emerald-500 transition-colors"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Technical Skills */}
            <div className="space-y-3 pt-4 border-t border-zinc-200">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Technical Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {(consultant.technicalSkills && consultant.technicalSkills.length > 0
                  ? consultant.technicalSkills
                  : [
                      'Data Analysis',
                      'Data Engineering',
                      'AI/ML',
                      'Automotive',
                      'Semiconductor',
                      'Software Engineering',
                    ]
                ).map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-zinc-50 text-zinc-800 border border-zinc-300 shadow-xs hover:border-emerald-500 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Genuine Reviews Section */}
          <div className="p-8 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  Client Reviews & Experiences
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Real feedback from verified 1-on-1 consultations
                </p>
              </div>

              <div className="flex items-center gap-1 bg-zinc-50 px-3 py-1.5 rounded-full text-xs font-semibold text-zinc-800 border border-zinc-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{consultant.rating} / 5.0</span>
              </div>
            </div>

            <div className="space-y-4">
              {consultant.reviews && consultant.reviews.length > 0 ? (
                consultant.reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center text-zinc-700 font-bold text-xs">
                          {rev.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-900">{rev.userName}</p>
                          <div className="flex items-center gap-0.5 text-amber-400">
                            {[...Array(rev.rating)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-400">Verified Client</span>
                    </div>

                    <p className="text-xs text-zinc-700 leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-zinc-500">
                  No reviews submitted yet for this consultant.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Booking Box */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-zinc-200 shadow-sm space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Consultation Fee
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-zinc-900 tracking-tight">
                  ₹{consultant.fee}/-
                </span>
                <span className="text-xs text-zinc-600 font-semibold">per hour</span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-zinc-700 py-4 border-y border-zinc-200">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Available: 7:00 PM – 9:00 PM (20 min session + 10 min break)</span>
              </div>
              <div className="flex items-center gap-2.5 text-zinc-500">
                <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0" />
                <span>Day slots (9:30 AM – 7:00 PM) booked already</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero double-booking guarantee</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Personalized roadmap & resume audit</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Official tax receipt & calendar invite</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate(`/book/${consultant._id}`)}
              className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
            >
              <span>Book Slots</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
              Available slots strictly synchronized with mentor’s schedule. Rescheduling allowed up to 12h prior.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../services/api';
import { Consultant } from '../types';
import { Star, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ReviewsGallery } from '../components/ReviewsGallery';

interface DirectoryProps {
  onNavigate: (path: string) => void;
}

const ASHISH_LINKEDIN_PFP =
  'https://media.licdn.com/dms/image/v2/D5603AQHgvioDlx9_IQ/profile-displayphoto-crop_800_800/B56Z6Y4CHeKsAM-/0/1780681286875?e=1790812800&v=beta&t=cNJpjcdLhjrXD9yCIux7_f5gICB2sThInUDzYEbESkI';
const ASHISH_LINKEDIN_URL = 'https://www.linkedin.com/in/ashish-lichode-b65532221/';

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
  slotDuration: 60,
  minNoticeHours: 24,
  workingDays: [1, 2, 3, 4, 5],
  workingHours: { start: '09:00', end: '18:00' },
  isActive: true,
};

export const ConsultantDirectory: React.FC<DirectoryProps> = ({ onNavigate }) => {
  const [consultant, setConsultant] = useState<Consultant>(DEFAULT_ASHISH);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchConsultant();
  }, []);

  const fetchConsultant = async () => {
    try {
      const res = await apiRequest<{
        success: boolean;
        data: Consultant[];
      }>('/consultants');

      if (res.data && res.data.length > 0) {
        // Find Ashish Lichode or take the first available consultant
        const ashish = res.data.find((c) => c.name.toLowerCase().includes('ashish')) || res.data[0];
        setConsultant(ashish);
      }
    } catch (error) {
      console.warn('Using default consultant profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const pfpUrl =
    consultant?.name?.toLowerCase().includes('ashish')
      ? (consultant.avatar || ASHISH_LINKEDIN_PFP)
      : (consultant?.avatar || ASHISH_LINKEDIN_PFP);

  return (
    <div className="w-[94%] sm:w-[82%] max-w-6xl mx-auto py-8 sm:py-12 space-y-12 animate-fade-in text-zinc-900">
      {/* Profile Section - Right Below Navbar */}
      <section id="mentor">
        {loading ? (
          <div className="p-16 text-center text-zinc-500 text-sm bg-white rounded-3xl border border-zinc-200">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading mentor profile...
          </div>
        ) : consultant ? (
          <div className="bg-white border border-zinc-200/90 rounded-3xl p-6 sm:p-10 shadow-[0_10px_35px_-8px_rgba(0,0,0,0.07)] hover:border-zinc-300 transition-all">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Mentor Identity & Quick Badges */}
              <div className="lg:col-span-4 flex flex-col items-center text-center space-y-5 bg-zinc-50/80 border border-zinc-200/80 rounded-2xl p-6">
                <div className="relative inline-block mx-auto">
                  <img
                    src={pfpUrl}
                    alt={consultant.name}
                    referrerPolicy="no-referrer"
                    className="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl object-cover border-4 border-white shadow-lg mx-auto"
                  />
                  <ShieldCheck
                    className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-6 h-6 sm:w-7 sm:h-7 text-emerald-400 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] pointer-events-none"
                    aria-label="Verified Mentor"
                  />
                </div>

                <div className="space-y-1 w-full flex justify-center">
                  <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-200 bg-white text-[11px] sm:text-xs italic text-zinc-800 shadow-xs max-w-[290px] text-center leading-relaxed">
                    <span>"You can dream about it because you have the potential to achieve it..."</span>
                  </div>
                </div>

                {/* Rating Card */}
                <div className="w-full bg-white border border-zinc-200/90 rounded-xl p-3 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="font-extrabold text-sm text-zinc-900">{consultant.rating}</span>
                    <span className="text-[11px] text-zinc-500">/ 5.0</span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {consultant.reviewCount} Reviews
                  </span>
                </div>

                {/* Connect on LinkedIn Button in Left Column */}
                <a
                  href={ASHISH_LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#004182] active:scale-[0.99] text-white text-xs sm:text-sm font-bold shadow-sm hover:shadow transition-all"
                >
                  <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74V10.13H5.06v8.37h2.8z" />
                  </svg>
                  <span>Connect on LinkedIn</span>
                </a>

                {/* Price Block */}
                <div className="w-full pt-3 border-t border-zinc-200/80">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-zinc-500 font-medium">Session Fee:</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-display text-lg font-black text-zinc-900">₹{consultant.fee || 999}/-</span>
                      <span className="text-xs text-zinc-600 font-semibold">per hour</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Bio, Value Proposition, Skills & CTA */}
              <div className="lg:col-span-8 space-y-6 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <div>
                    <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-zinc-950 tracking-tight">
                      {consultant.name}
                    </h1>
                    <p className="text-base sm:text-lg font-semibold text-emerald-700 mt-1.5">
                      {consultant.domain === 'Engineering Leader & Career Consultant'
                        ? 'Engineering Consultant'
                        : consultant.domain}
                    </p>
                  </div>

                  {/* 1-on-1 Deliverables Highlight Box */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200/90 space-y-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-600 block">
                      What you get in your 1-on-1 consultation:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-zinc-800 font-medium">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Comprehensive Resume Audit</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Clear Tech Stack Roadmap</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Live 1-on-1 Google Meet Call</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Instant Receipt & Calendar Invite</span>
                      </div>
                    </div>
                  </div>

                  {/* Expertise */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                      Expertise
                    </span>
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
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                      Technical Domain
                    </span>
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

                {/* CTA Block */}
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate(`/book/${consultant._id}`)}
                    className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-extrabold text-base sm:text-lg shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all flex items-center justify-center gap-2.5"
                  >
                    <span>Book a slot with Ashish</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-16 text-center text-zinc-500 text-sm bg-white rounded-3xl border border-zinc-200">
            Consultant profile unavailable.
          </div>
        )}
      </section>

      {/* Reviews & Feedbacks Below the Profile */}
      <section>
        <ReviewsGallery />
      </section>
    </div>
  );
};

export default ConsultantDirectory;

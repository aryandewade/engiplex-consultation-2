import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Search,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  GraduationCap,
  MessageSquare,
  Filter,
  MessageSquarePlus,
  X,
  Send,
  Loader2,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { apiRequest } from '../services/api';
import { Review } from '../types';

// Fallback bundle with all 48 user reviews to guarantee 0 delay rendering
export const FALLBACK_REVIEWS: Array<{ name: string; quote: string; tag: string; rating: number }> = [
  {
    name: 'Aarav Sharma',
    quote: 'Clear and practical career consulting. I was confused about which direction to take after graduation, but the roadmap gave me a much better understanding of what skills and roles I should target.',
    tag: 'Freshers & Students',
    rating: 5,
  },
  {
    name: 'Priya Kulkarni',
    quote: 'The counselling session was very straightforward. Instead of giving generic advice, I received a clear career roadmap based on my current skills and goals.',
    tag: 'Roadmap & Skills',
    rating: 5,
  },
  {
    name: 'Rohan Patil',
    quote: 'I was applying for jobs randomly without getting results. The consultation helped me understand where I was going wrong and how to improve my approach.',
    tag: 'Resume & Strategy',
    rating: 4,
  },
  {
    name: 'Sneha Joshi',
    quote: 'Very useful guidance for a fresher. I got clarity about which technologies to learn, which roles to apply for, and how to prepare for interviews.',
    tag: 'Freshers & Students',
    rating: 4.5,
  },
  {
    name: 'Aditya Verma',
    quote: 'The best part was the clear-cut consulting. Everything was explained practically without making the process complicated.',
    tag: 'Consulting',
    rating: 5,
  },
  {
    name: 'Neha Deshmukh',
    quote: 'I was unsure whether I should continue in my current field or switch careers. The counselling helped me compare both options and make a much more informed decision.',
    tag: 'Career Switch',
    rating: 5,
  },
  {
    name: 'Vivek Gupta',
    quote: 'Excellent career guidance. The roadmap helped me understand what I should focus on during the next few months instead of trying to learn everything at once.',
    tag: 'Roadmap & Skills',
    rating: 4.5,
  },
  {
    name: 'Kavya Nair',
    quote: 'As a student, I was confused about what to do after my degree. The session gave me a realistic understanding of career options and skill requirements.',
    tag: 'Freshers & Students',
    rating: 5,
  },
  {
    name: 'Siddharth Jadhav',
    quote: 'I appreciated the practical approach. There was no unnecessary discussion—just clear advice about my career, skills, resume and job strategy.',
    tag: 'Resume & Strategy',
    rating: 4.5,
  },
  {
    name: 'Anjali Mehta',
    quote: 'The counselling helped me identify the gap between my current profile and the jobs I wanted. I now have a proper plan to work on those gaps.',
    tag: 'Resume & Strategy',
    rating: 5,
  },
  {
    name: 'Rahul Chavan',
    quote: 'I received very useful guidance regarding skill development. I was specifically looking for a good institute and got suggestions based on my career objective rather than random recommendations.',
    tag: 'Roadmap & Skills',
    rating: 5,
  },
  {
    name: 'Isha Singh',
    quote: "Very helpful for students who don't know where to start. The roadmap made my career preparation much more structured.",
    tag: 'Freshers & Students',
    rating: 5,
  },
  {
    name: 'Manish Yadav',
    quote: 'I had been working in the same role for a long time and wanted better opportunities. The consultation helped me understand how to position my experience for my next career move.',
    tag: 'Career Switch',
    rating: 4.5,
  },
  {
    name: 'Pooja Pawar',
    quote: 'The fees were reasonable compared with the clarity I received. I finally understood which career path actually made sense for me.',
    tag: 'Consulting',
    rating: 5,
  },
  {
    name: 'Karan Malhotra',
    quote: 'I was struggling to decide between two career options. The consultant explained the pros, cons and long-term opportunities very clearly.',
    tag: 'Career Switch',
    rating: 5,
  },
  {
    name: 'Ritika Sharma',
    quote: 'Good career counselling for fresh graduates. The advice was practical, realistic and focused on employability.',
    tag: 'Freshers & Students',
    rating: 5,
  },
  {
    name: 'Akshay More',
    quote: 'The guidance helped me restructure my job-search strategy. I stopped applying blindly and started targeting roles that actually matched my profile.',
    tag: 'Resume & Strategy',
    rating: 5,
  },
  {
    name: 'Simran Kaur',
    quote: 'Very professional consultation. I received a step-by-step roadmap covering skills, resume improvement, applications and interview preparation.',
    tag: 'Resume & Strategy',
    rating: 5,
  },
  {
    name: 'Nikhil Bansal',
    quote: 'I was able to secure a new opportunity with a 15% salary hike after following the career and interview guidance.',
    tag: 'Salary Hike & Growth',
    rating: 5,
  },
  {
    name: 'Tanvi Desai',
    quote: "The biggest benefit was clarity. I knew what I wanted to achieve, but I didn't know how to reach there. The roadmap changed that.",
    tag: 'Roadmap & Skills',
    rating: 5,
  },
  {
    name: 'Harsh Vora',
    quote: 'Excellent support for working professionals. The discussion was focused on my experience and future growth rather than generic career advice.',
    tag: 'Career Switch',
    rating: 5,
  },
  {
    name: 'Shreya Patil',
    quote: "I was looking for a career switch but didn't know which skills were actually required. The counselling helped me create a realistic transition plan.",
    tag: 'Career Switch',
    rating: 5,
  },
  {
    name: 'Yash Thakur',
    quote: "The consultant gave me honest feedback about my profile. It wasn't sugar-coated, and that was exactly what I needed.",
    tag: 'Consulting',
    rating: 5,
  },
  {
    name: 'Komal Shah',
    quote: "I received guidance on choosing the right skill-development program instead of spending money on courses that weren't relevant to my career.",
    tag: 'Roadmap & Skills',
    rating: 5,
  },
  {
    name: 'Amit Joshi',
    quote: 'Within 22 days, I was able to secure a job opportunity after improving my resume, applications and interview preparation based on the guidance.',
    tag: 'Salary Hike & Growth',
    rating: 5,
  },
  {
    name: 'Divya Reddy',
    quote: 'Very helpful for someone starting their career. I got clarity about the difference between simply completing courses and actually becoming job-ready.',
    tag: 'Freshers & Students',
    rating: 5,
  },
  {
    name: 'Saurabh Mishra',
    quote: 'The consultation helped me understand what companies were actually looking for in my field. My job search became much more focused.',
    tag: 'Resume & Strategy',
    rating: 5,
  },
  {
    name: 'Meenal Wagh',
    quote: "I liked the honest and practical approach. The consultant didn't push unnecessary courses and instead suggested what I genuinely needed.",
    tag: 'Consulting',
    rating: 5,
  },
  {
    name: 'Abhishek Tiwari',
    quote: 'After following the recommended career strategy, I received an opportunity with approximately a 33% salary hike.',
    tag: 'Salary Hike & Growth',
    rating: 5,
  },
  {
    name: 'Riya Kapoor',
    quote: 'I was completely confused after graduation. The counselling gave me a structured roadmap covering skills, projects, resume and job applications.',
    tag: 'Freshers & Students',
    rating: 5,
  },
  {
    name: 'Omkar Shinde',
    quote: 'Good consulting at a reasonable fee. I got much more clarity about my career direction than I expected.',
    tag: 'Consulting',
    rating: 4.5,
  },
  {
    name: 'Nandini Rao',
    quote: 'The guidance helped me understand which certifications were actually useful for my target role and which ones I could avoid.',
    tag: 'Roadmap & Skills',
    rating: 4.5,
  },
  {
    name: 'Mohit Agarwal',
    quote: 'I had been searching for a job for months. The changes suggested during counselling helped me improve my approach, and I received an opportunity within 45 days.',
    tag: 'Salary Hike & Growth',
    rating: 5,
  },
  {
    name: 'Ayesha Khan',
    quote: 'Very useful career counselling for students. I got a clear understanding of what to learn and how to build my profile before applying for jobs.',
    tag: 'Freshers & Students',
    rating: 5,
  },
  {
    name: 'Pratik Pawar',
    quote: 'The consultant helped me identify the skills holding back my career growth. The roadmap was simple enough to follow and specific enough to be useful.',
    tag: 'Roadmap & Skills',
    rating: 4.5,
  },
  {
    name: 'Shubham Gupta',
    quote: 'I achieved a 45% salary hike after preparing properly for my career move. The guidance around profile positioning and interview preparation was particularly useful.',
    tag: 'Salary Hike & Growth',
    rating: 5,
  },
  {
    name: 'Swati Kapse',
    quote: 'I was unsure whether I needed another degree or simply the right technical skills. The consultation helped me make a much more practical decision.',
    tag: 'Career Switch',
    rating: 4,
  },
  {
    name: 'Vishal Soni',
    quote: 'Straightforward and professional career advice. I especially liked the focus on actual job opportunities rather than unrealistic promises.',
    tag: 'Consulting',
    rating: 5,
  },
  {
    name: 'Pallavi Nair',
    quote: 'The roadmap gave me a clear sequence: what to learn first, what projects to build, when to improve my resume and when to start applying.',
    tag: 'Roadmap & Skills',
    rating: 5,
  },
  {
    name: 'Deepak Rajput',
    quote: "After several unsuccessful applications, I finally understood that the problem wasn't only the number of applications—it was how I was presenting my skills. Very valuable guidance.",
    tag: 'Resume & Strategy',
    rating: 5,
  },
  {
    name: 'Mansi Jain',
    quote: 'I received a 100% salary hike after making a planned career move. The counselling helped me understand my market value and prepare accordingly.',
    tag: 'Salary Hike & Growth',
    rating: 5,
  },
  {
    name: 'Tejas Patil',
    quote: 'Very good guidance for freshers. I got clarity about realistic salary expectations, suitable job roles and the skills I should develop.',
    tag: 'Freshers & Students',
    rating: 5,
  },
  {
    name: 'Swati Sharma',
    quote: 'The consultant understood my situation before suggesting anything. The advice felt personalised rather than like a standard counselling session.',
    tag: 'Consulting',
    rating: 5,
  },
  {
    name: 'Raj Mehra',
    quote: 'I was considering changing my career but was worried about starting again. The consultation helped me identify transferable skills and a practical transition path.',
    tag: 'Career Switch',
    rating: 4.5,
  },
  {
    name: 'Poonam Choudhary',
    quote: 'The biggest takeaway was the career roadmap. Instead of feeling lost, I now have measurable steps to follow for the next few months.',
    tag: 'Roadmap & Skills',
    rating: 5,
  },
  {
    name: 'Arjun Deshmukh',
    quote: 'I received an opportunity with around a 15% hike after improving my profile and interview preparation. The guidance was practical and easy to implement.',
    tag: 'Salary Hike & Growth',
    rating: 5,
  },
  {
    name: 'Snehal More',
    quote: 'I would recommend this counselling to students who are confused about career choices. The session gave me clarity about skills, institutes, job roles and the overall career path.',
    tag: 'Freshers & Students',
    rating: 5,
  },
  {
    name: 'Varun Kapoor',
    quote: 'Professional, transparent and to the point. I especially appreciated the fact that the consultant explained both the opportunities and the challenges before recommending a career path.',
    tag: 'Consulting',
    rating: 5,
  },
];

const BASELINE_CUSTOM_RATINGS: Record<string, number> = {
  'Rohan Patil': 4.0,
  'Swati Kapse': 4.0,
  'Sneha Joshi': 4.5,
  'Vivek Gupta': 4.5,
  'Siddharth Jadhav': 4.5,
  'Manish Yadav': 4.5,
  'Omkar Shinde': 4.5,
  'Nandini Rao': 4.5,
  'Pratik Pawar': 4.5,
  'Raj Mehra': 4.5,
};

// Reusable stars component supporting full, half and outline stars
export const renderReviewStars = (rating: number) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((starIdx) => {
        const isFull = rating >= starIdx;
        const isHalf = !isFull && rating >= starIdx - 0.5;

        return (
          <div key={starIdx} className="relative w-4 h-4 shrink-0">
            {/* Outline / empty base star */}
            <Star className="w-4 h-4 text-zinc-300" />
            {/* Full amber star */}
            {isFull && (
              <Star className="w-4 h-4 fill-amber-400 text-amber-400 absolute inset-0" />
            )}
            {/* Half amber star */}
            {isHalf && (
              <div className="absolute inset-0 overflow-hidden w-[50%]">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
            )}
          </div>
        );
      })}
      <span className="text-xs font-bold text-zinc-700 ml-1.5 tabular-nums">
        {rating % 1 === 0 ? `${rating}.0` : rating}
      </span>
    </div>
  );
};

export const ReviewsGallery: React.FC = () => {
  const [reviewsList, setReviewsList] = useState<Array<{ name: string; quote: string; tag: string; rating: number }>>(FALLBACK_REVIEWS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Give Feedback Modal State
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [feedbackName, setFeedbackName] = useState<string>('');
  const [feedbackEmail, setFeedbackEmail] = useState<string>('');
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedbackTag, setFeedbackTag] = useState<string>('Career Roadmap');
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Auto-fill reviewer info from logged-in user if available
  useEffect(() => {
    if (isFeedbackModalOpen) {
      try {
        const stored = localStorage.getItem('consultflow_user');
        if (stored) {
          const u = JSON.parse(stored);
          if (u.email && !feedbackEmail) setFeedbackEmail(u.email);
          if (u.name && !feedbackName) setFeedbackName(u.name);
        }
      } catch {
        // ignore
      }
    }
  }, [isFeedbackModalOpen]);

  // Attempt to fetch from backend
  useEffect(() => {
    apiRequest<{ success: boolean; data: Review[] }>('/reviews')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((r) => {
            const custom = BASELINE_CUSTOM_RATINGS[r.userName];
            return {
              name: r.userName,
              quote: r.comment,
              tag: r.tag || 'Consulting',
              rating: custom !== undefined ? custom : (Number(r.rating) || 5),
            };
          });
          setReviewsList(mapped);
        }
      })
      .catch((_) => {
        // Fallback reviews are already set
      });
  }, []);

  // Real-time calculated metrics
  const totalReviews = reviewsList.length;

  const averageRating = useMemo(() => {
    if (!reviewsList.length) return '5.0';
    const sum = reviewsList.reduce((acc, r) => acc + (Number(r.rating) || 5), 0);
    return (sum / reviewsList.length).toFixed(1);
  }, [reviewsList]);

  const filteredReviews = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return reviewsList;
    return reviewsList.filter((rev) => {
      return (
        rev.name.toLowerCase().includes(q) ||
        rev.quote.toLowerCase().includes(q)
      );
    });
  }, [reviewsList, searchQuery]);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName.trim()) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!feedbackEmail.trim() || !feedbackEmail.includes('@')) {
      setFormError('Please enter a valid email address to verify your booking.');
      return;
    }
    if (!feedbackComment.trim() || feedbackComment.trim().length < 5) {
      setFormError('Please share at least 5 characters in your feedback.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const res = await apiRequest<{ success: boolean; data: any; message?: string }>('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          name: feedbackName.trim(),
          userName: feedbackName.trim(),
          email: feedbackEmail.trim().toLowerCase(),
          rating: feedbackRating,
          comment: feedbackComment.trim(),
          tag: feedbackTag || 'Career Roadmap',
        }),
      });

      if (res && res.success) {
        const created = res.data;
        const newEntry = {
          name: (created && created.userName) || feedbackName.trim(),
          quote: (created && created.comment) || feedbackComment.trim(),
          tag: (created && created.tag) || feedbackTag || 'Career Roadmap',
          rating: (created && Number(created.rating)) || feedbackRating,
        };

        // Real-time update with verified review
        setReviewsList((prev) => [newEntry, ...prev]);
        setIsFeedbackModalOpen(false);
        setFeedbackSuccess('Thank you! Your verified feedback has been published in real time.');
        setFeedbackName('');
        setFeedbackEmail('');
        setFeedbackComment('');
        setFeedbackRating(5);
        setTimeout(() => {
          setFeedbackSuccess(null);
        }, 7000);
      }
    } catch (err: any) {
      console.warn('Feedback verification or submission failed:', err);
      const msg =
        err?.message ||
        'No slot booking found for this email address. Only clients with a confirmed booking can submit a review.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="feedbacks" className="space-y-8 pt-6 relative">
      {/* Metric Highlight Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-zinc-200/90 shadow-[0_10px_35px_-8px_rgba(0,0,0,0.06)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        <div className="space-y-2.5 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Verified Client Outcomes
          </div>
          <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight">
            Client Feedbacks & Experiences
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            Feedbacks from experienced working professionals, students, freshers, and engineers who booked 1-on-1 consultations with Ashish Lichode for strategic career roadmaps, market intelligence, resume audits, and interview preparation.
          </p>
        </div>

        {/* Stats & Add Review Action */}
        <div className="flex flex-col gap-3 w-full sm:w-auto shrink-0">
          {/* Metrics Pair */}
          <div className="grid grid-cols-2 gap-3 w-full sm:w-[320px]">
            {/* Stat 1: Total count in real time */}
            <div className="p-4 sm:p-4.5 rounded-2xl bg-zinc-50 border border-zinc-200/90 text-center flex flex-col justify-center">
              <span id="stat-total-reviews" className="font-display text-2xl sm:text-3xl font-black text-zinc-900 tabular-nums">
                {totalReviews}
              </span>
              <span className="text-[11px] sm:text-xs text-zinc-500 block mt-0.5 font-semibold whitespace-nowrap">
                Verified Reviews
              </span>
            </div>

            {/* Stat 2: Real-time Average Rating formatted as X.X/5 */}
            <div className="p-4 sm:p-4.5 rounded-2xl bg-zinc-50 border border-zinc-200/90 text-center flex flex-col justify-center">
              <div className="flex items-center justify-center gap-1.5">
                <span id="stat-avg-rating" className="font-display text-2xl sm:text-3xl font-black text-zinc-900 tabular-nums">
                  {averageRating}/5
                </span>
                <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400 shrink-0" />
              </div>
              <span className="text-[11px] sm:text-xs text-zinc-500 block mt-0.5 font-semibold whitespace-nowrap">
                Average Rating
              </span>
            </div>
          </div>

          {/* Add Review Action Button - Perfectly aligned across the full width of the stats block */}
          <button
            type="button"
            id="give-feedback-btn"
            onClick={() => {
              setIsFeedbackModalOpen(true);
              setFormError(null);
            }}
            className="w-full py-3 sm:py-3.5 px-5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-900 flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer group active:scale-[0.98]"
          >
            <MessageSquarePlus className="w-4.5 h-4.5 text-emerald-400 group-hover:scale-110 transition-transform shrink-0" />
            <span className="font-display text-sm font-bold text-white tracking-wide whitespace-nowrap">
              Add Review
            </span>
          </button>
        </div>
      </div>

      {/* Real-time Success Notification */}
      {feedbackSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{feedbackSuccess}</span>
          </div>
          <button
            onClick={() => setFeedbackSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-sm px-1.5 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="pt-2">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search reviews by keyword, topic, role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-zinc-300 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* Reviews Grid */}
      {filteredReviews.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-zinc-200 bg-zinc-50 space-y-3">
          <p className="text-zinc-600 font-medium">No reviews match "{searchQuery}"</p>
          <button
            onClick={() => setSearchQuery('')}
            className="px-4 py-2 rounded-lg bg-zinc-200 text-zinc-800 text-xs font-semibold hover:bg-zinc-300 transition-colors"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredReviews.slice(0, visibleCount).map((rev, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-6 border border-zinc-200/90 shadow-[0_4px_16px_-4px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_-6px_rgba(0,0,0,0.09)] hover:-translate-y-1 hover:border-zinc-300 transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3.5">
                  {/* Top Bar: Avatar, Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-extrabold text-sm shrink-0">
                      {rev.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-display text-sm font-bold text-zinc-900">
                        {rev.name}
                      </h4>
                    </div>
                  </div>

                  {/* Rating Stars with half star support */}
                  {renderReviewStars(rev.rating)}

                  {/* Feedback Quote */}
                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-normal">
                    "{rev.quote}"
                  </p>
                </div>

                {/* Footer badge */}
                <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Client Outcome
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < filteredReviews.length && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setVisibleCount((prev) => Math.min(prev + 12, filteredReviews.length))}
                className="px-6 py-2.5 rounded-xl bg-white border border-zinc-300 text-zinc-800 text-xs font-semibold hover:bg-zinc-50 transition-all shadow-sm"
              >
                Load More Reviews ({filteredReviews.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}

      {/* Give Feedback Modal Dialog */}
      {isFeedbackModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFeedbackModalOpen(false);
          }}
        >
          <div className="relative w-full max-w-lg bg-white rounded-3xl border border-zinc-200 shadow-2xl p-6 sm:p-8 space-y-5 animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-4">
              <div>

                <h3 className="font-display text-xl sm:text-2xl font-bold text-zinc-900">
                  Share Your Feedback
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                  Help others learn from your consultation experience with Ashish Lichode.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsFeedbackModalOpen(false)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Rating Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Overall Rating <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[5, 4.5, 4, 3.5, 3].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFeedbackRating(val)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${feedbackRating === val
                        ? 'bg-amber-400 text-zinc-950 shadow-xs'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{val} Stars</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  {renderReviewStars(feedbackRating)}
                  <span className="text-xs text-zinc-500 font-medium">
                    {feedbackRating === 5 && '— Outstanding & Highly Recommended'}
                    {feedbackRating === 4.5 && '— Excellent & Practical'}
                    {feedbackRating === 4 && '— Very Good Guidance'}
                    {feedbackRating === 3.5 && '— Good Advice'}
                    {feedbackRating === 3 && '— Average'}
                  </span>
                </div>
              </div>

              {/* Reviewer Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Your Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aryan Sharma"
                  value={feedbackName}
                  onChange={(e) => setFeedbackName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-xs"
                />
              </div>

              {/* Reviewer Booking Email (Required for Slot Booking Verification) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                    Booking Email <span className="text-rose-500">*</span>
                  </label>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified Booking Required
                  </span>
                </div>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. client@example.com (used during slot booking)"
                    value={feedbackEmail}
                    onChange={(e) => setFeedbackEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 transition-colors shadow-xs"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 leading-tight">
                  Only clients who have booked a consultation session with this email can publish a review.
                </p>
              </div>

              {/* Consultation Focus Area */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Consultation Focus Area
                </label>
                <select
                  value={feedbackTag}
                  onChange={(e) => setFeedbackTag(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 text-xs sm:text-sm text-zinc-900 bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                >
                  <option value="Career Roadmap">Career Roadmap</option>
                  <option value="Resume Strategy">Resume Strategy</option>
                  <option value="System Architecture">System Architecture</option>
                  <option value="Interview Prep">Interview Prep</option>
                  <option value="Salary Negotiation">Salary Negotiation</option>
                  <option value="Technical Skills">Technical Skills (AI/ML, Data)</option>
                  <option value="Freshers & Students">Freshers & Students Guidance</option>
                  <option value="Consulting">Consulting</option>
                </select>
              </div>

              {/* Review Comment */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider">
                  Your Feedback & Experience <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share details about your session: What was discussed? How practical was the roadmap or resume feedback? How did it help you?"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="w-full p-3 rounded-xl border border-zinc-300 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-emerald-600 transition-colors resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsFeedbackModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-zinc-300 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

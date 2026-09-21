import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../services/api';
import { Consultant } from '../types';
import {
  HelpCircle,
  ChevronDown,
  ShieldCheck,
  FileText,
  RotateCcw,
  Mail,
} from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const [mentorId, setMentorId] = useState<string | null>(null);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const supportMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch active consultant for 1-click "Book a slot" navigation
    apiRequest<{ success: boolean; data: Consultant[] }>('/consultants')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setMentorId(res.data[0]._id);
        }
      })
      .catch(() => { });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (supportMenuRef.current && !supportMenuRef.current.contains(e.target as Node)) {
        setIsSupportOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBookSlotClick = () => {
    if (mentorId) {
      onNavigate(`/book/${mentorId}`);
    } else {
      onNavigate('/consultants');
    }
  };

  const handleFeedbacksClick = () => {
    if (currentPath !== '/consultants' && currentPath !== '/') {
      onNavigate('/consultants');
      setTimeout(() => {
        const el = document.getElementById('feedbacks');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      const el = document.getElementById('feedbacks');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleMentorsClick = () => {
    if (currentPath !== '/consultants' && currentPath !== '/') {
      onNavigate('/consultants');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSupportNavigate = (path: string) => {
    setIsSupportOpen(false);
    if (path.includes('#')) {
      const [basePath, hash] = path.split('#');
      onNavigate(basePath);
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } else {
      onNavigate(path);
    }
  };

  return (
    <header className="sticky top-3.5 z-50 w-full px-4 sm:px-6 pointer-events-none">
      <div className="w-[94%] sm:w-[82%] max-w-6xl mx-auto bg-white border border-zinc-200 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.06)] h-16 px-5 sm:px-8 flex items-center justify-between pointer-events-auto transition-all">
        {/* Left Side: Logo */}
        <div
          onClick={() => onNavigate('/consultants')}
          className="flex items-center cursor-pointer select-none py-1"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('/consultants')}
        >
          <img
            src="/engiplex-logo.png"
            alt="ENGIPLEX Consultation"
            className="h-9 sm:h-11 w-auto object-contain hover:opacity-90 transition-opacity"
          />
        </div>

        {/* Right Side: Mentors, Feedbacks, Help & Support, Book a slot */}
        <div className="flex items-center gap-3 sm:gap-5 text-xs sm:text-sm font-medium">
          <button
            onClick={handleMentorsClick}
            className="text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Consultants
          </button>

          <button
            onClick={handleFeedbacksClick}
            className="text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Feedbacks
          </button>

          {/* Help & Support Dropdown */}
          <div className="relative" ref={supportMenuRef}>
            <button
              onClick={() => setIsSupportOpen(!isSupportOpen)}
              className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 transition-colors py-1 cursor-pointer font-medium"
              aria-expanded={isSupportOpen}
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Help &amp; Support</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                  isSupportOpen ? 'rotate-180 text-zinc-700' : ''
                }`}
              />
            </button>

            {isSupportOpen && (
              <div className="absolute right-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-2.5 w-64 bg-white rounded-2xl border border-zinc-200 shadow-xl py-2 z-50 animate-fade-in divide-y divide-zinc-100">
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Help &amp; Legal Policies</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </div>

                <div className="py-1">
                  {/* Privacy Policy */}
                  <button
                    onClick={() => handleSupportNavigate('/privacy')}
                    className="w-full px-3.5 py-2.5 text-left text-xs text-zinc-700 hover:text-zinc-900 hover:bg-emerald-50/70 flex items-center gap-2.5 transition-colors cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-zinc-900">Privacy Policy</span>
                      <span className="text-[10px] text-zinc-500">Data protection &amp; DPDP 2023</span>
                    </div>
                  </button>

                  {/* Terms & Conditions */}
                  <button
                    onClick={() => handleSupportNavigate('/terms')}
                    className="w-full px-3.5 py-2.5 text-left text-xs text-zinc-700 hover:text-zinc-900 hover:bg-emerald-50/70 flex items-center gap-2.5 transition-colors cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-zinc-900">Terms &amp; Conditions</span>
                      <span className="text-[10px] text-zinc-500">User agreement &amp; legal terms</span>
                    </div>
                  </button>

                  {/* Refund Policy */}
                  <button
                    onClick={() => handleSupportNavigate('/terms#refund-policy')}
                    className="w-full px-3.5 py-2.5 text-left text-xs text-zinc-700 hover:text-zinc-900 hover:bg-emerald-50/70 flex items-center gap-2.5 transition-colors cursor-pointer group"
                  >
                    <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                      <RotateCcw className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold block text-zinc-900">Refund Policy</span>
                      <span className="text-[10px] text-zinc-500">48-hour refunds &amp; cancellations</span>
                    </div>
                  </button>
                </div>

                <div className="p-2.5 bg-zinc-50/80 rounded-b-2xl">
                  <a
                    href="mailto:support@engiplex.com"
                    className="flex items-center gap-2 px-2 py-1 text-[11px] text-zinc-600 hover:text-emerald-700 transition-colors font-medium"
                  >
                    <Mail className="w-3.5 h-3.5 text-emerald-600" />
                    <span>support@engiplex.com</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleBookSlotClick}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all shadow-sm active:scale-95 text-xs sm:text-sm shrink-0"
          >
            Book a slot
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

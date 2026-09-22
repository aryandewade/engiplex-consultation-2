import React from 'react';
import { ShieldCheck, Clock, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-zinc-200 bg-white mt-20 text-xs text-zinc-500">
      <div className="w-[94%] sm:w-[82%] max-w-6xl mx-auto px-2 sm:px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2 space-y-3.5">
            <div
              className="flex items-center cursor-pointer inline-block"
              onClick={() => onNavigate?.('/consultants')}
            >
              <img
                src="/engiplex-logo.png"
                alt="ENGIPLEX Consultation"
                className="h-12 sm:h-16 w-auto object-contain hover:opacity-90 transition-opacity"
              />
            </div>
            <p className="text-zinc-500 text-xs max-w-sm leading-relaxed">
              1-on-1 career and technical advisory appointments with verified consultants.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-800 mb-3 text-xs uppercase tracking-wider">
              Booking Policy
            </h4>
            <ul className="space-y-2 text-zinc-600">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zero Double Booking</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>1hr Focused Sessions</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Official Receipts</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-800 mb-3 text-xs uppercase tracking-wider">
              Pricing & Timing
            </h4>
            <ul className="space-y-2 text-zinc-600">
              <li>Standard ₹999/- per hour</li>
              <li>Personalized 1-on-1 Guidance</li>
              <li>Full Day slots as per availability</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-zinc-500">
          <p>© {new Date().getFullYear()} ENGIPLEX. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a href="#feedbacks" className="hover:text-zinc-900 transition-colors">Client Reviews & Feedbacks</a>
            <span>•</span>
            <button
              onClick={() => onNavigate ? onNavigate('/privacy') : (window.location.href = '/privacy')}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate ? onNavigate('/terms') : (window.location.href = '/terms')}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
            <span>•</span>
            <button
              onClick={() => onNavigate ? onNavigate('/login') : (window.location.href = '/login')}
              className="text-emerald-700 font-bold hover:underline transition-colors cursor-pointer"
            >
              Mentor Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

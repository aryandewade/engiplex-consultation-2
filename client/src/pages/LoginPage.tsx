import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Calendar,
  Video,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

interface LoginProps {
  onNavigate: (path: string) => void;
  redirectPath?: string;
}

export const LoginPage: React.FC<LoginProps> = ({ onNavigate, redirectPath }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email.trim().toLowerCase(), password);
      onNavigate(redirectPath || '/consultant/dashboard');
    } catch (err: any) {
      setError(err.message || 'Mentor login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickMentorLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await login('ashish@engiplex.com', 'mentor@engiplex');
      onNavigate(redirectPath || '/consultant/dashboard');
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-white shadow-sm border border-zinc-200 mx-auto">
            <img
              src="/engiplex-logo.png"
              alt="ENGIPLEX Consultation"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Secure Mentor Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              Mentor Login
            </h1>
            <p className="text-xs text-zinc-600 max-w-sm mx-auto">
              Authorized access to your daily consultation schedule, client details, and Google Meet room.
            </p>
          </div>
        </div>

        {/* 1-Click Fast Mentor Access */}
        <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl space-y-3 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              1-Click Fast Login
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
              Verified Advisor
            </span>
          </div>

          <p className="text-[11px] text-zinc-400">
            Instantly authenticate with your registered mentor account and access your appointment dashboard.
          </p>

          <button
            type="button"
            onClick={handleQuickMentorLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Authenticating...' : 'Sign In as Mentor'}</span>
          </button>
        </div>

        {/* Standard Mentor Login Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl space-y-5">
          <div className="border-b border-zinc-800 pb-3 flex items-center justify-between">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Or Enter Credentials
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono">256-Bit SSL</span>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 font-semibold mb-1.5">Mentor Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="Enter mentor email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-400 font-semibold mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                  title={showPassword ? 'Hide Password' : 'Show Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] shadow-lg shadow-emerald-600/20"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Perks Overview */}
          <div className="pt-3 border-t border-zinc-800/80 grid grid-cols-2 gap-2 text-[11px] text-zinc-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Daily Schedules</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Video className="w-3.5 h-3.5 text-emerald-400" />
              <span>Google Meet Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

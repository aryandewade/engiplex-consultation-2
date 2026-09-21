import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, ArrowRight, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

interface LoginProps {
  onNavigate: (path: string) => void;
  redirectPath?: string;
}

export const LoginPage: React.FC<LoginProps> = ({ onNavigate, redirectPath }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const user = await login(email, password);
      if (redirectPath) {
        onNavigate(redirectPath);
      } else if (user.role === 'ADMIN') {
        onNavigate('/admin');
      } else if (user.role === 'CONSULTANT') {
        onNavigate('/consultant/dashboard');
      } else {
        onNavigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (role: 'client' | 'mentor' | 'admin') => {
    setLoading(true);
    setError(null);
    try {
      if (role === 'admin') {
        await login('admin@consultflow.com', 'Admin@1234');
        onNavigate('/admin');
      } else if (role === 'mentor') {
        await login('rahul.sharma@consultflow.org', 'Mentor@1234');
        onNavigate('/consultant/dashboard');
      } else {
        await login('client@example.com', 'Client@1234');
        onNavigate(redirectPath || '/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-2xl bg-white shadow-sm border border-zinc-200 mx-auto">
            <img
              src="/engiplex-logo.png"
              alt="ENGIPLEX Consultation"
              className="h-9 w-auto object-contain"
            />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Sign In to Engiplex</h1>
          <p className="text-xs text-zinc-500">
            Access mentor schedules, upcoming bookings, and receipts
          </p>
        </div>

        {/* Demo Fast Login Buttons */}
        <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant Demo Logins (1-Click)</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('client')}
              disabled={loading}
              className="py-2 px-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
            >
              <span>Client</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('mentor')}
              disabled={loading}
              className="py-2 px-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-800/80 text-emerald-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Mentor</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin')}
              disabled={loading}
              className="py-2 px-2.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/60 text-purple-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1"
            >
              <Shield className="w-3 h-3 text-purple-400" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-zinc-800/90 shadow-2xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-400 font-semibold mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-zinc-400 font-semibold">Password</label>
                <button
                  type="button"
                  onClick={() => alert('Password reset link sent to demo registered email.')}
                  className="text-[11px] text-emerald-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center pt-2 border-t border-zinc-800/80 text-xs text-zinc-400">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('/register')}
              className="text-emerald-400 font-semibold hover:underline"
            >
              Create Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

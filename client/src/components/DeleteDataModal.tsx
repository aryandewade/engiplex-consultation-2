import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Trash2,
  Mail,
  User,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  X,
  ArrowRight,
  Clock,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { apiRequest } from '../services/api';

interface DeleteDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteDataModal: React.FC<DeleteDataModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'REQUEST' | 'VERIFY' | 'SUCCESS'>('REQUEST');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    userName: string;
    email: string;
    creationDate: string;
    deletionDate: string;
  } | null>(null);

  // Timer for OTP validity
  const [countdown, setCountdown] = useState<number>(600); // 10 mins

  useEffect(() => {
    let timer: any;
    if (step === 'VERIFY' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const resetModal = () => {
    setStep('REQUEST');
    setName('');
    setEmail('');
    setOtp('');
    setLoading(false);
    setErrorMsg(null);
    setSuccessInfo(null);
    setCountdown(600);
    onClose();
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Please enter your full name as registered.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/privacy/request-deletion-otp', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
        }),
      });

      setStep('VERIFY');
      setCountdown(600);
    } catch (err: any) {
      setErrorMsg(
        err.message || 'No account found matching this name and email. Please check your details.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMsg('Please enter the 6-digit verification code sent to your email.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiRequest<{
        success: boolean;
        message: string;
        data: {
          userName: string;
          email: string;
          creationDate: string;
          deletionDate: string;
        };
      }>('/privacy/verify-and-delete', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          otp: otp.trim(),
        }),
      });

      setSuccessInfo(res.data);
      setStep('SUCCESS');

      // If user was logged in with this email, clear auth state
      const currentToken = localStorage.getItem('consultflow_token');
      if (currentToken) {
        localStorage.removeItem('consultflow_token');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden relative animate-scale-in text-zinc-900">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-6 relative">
          <button
            onClick={resetModal}
            className="absolute top-5 right-5 p-2 rounded-full bg-black/20 hover:bg-black/30 text-white/90 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">Delete My Data (Right to Erasure)</h3>
              <p className="text-xs text-rose-100 font-normal">
                DPDP Act, 2023 &amp; IT Rules Self-Service Data Deletion
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* STEP 1: Identification Form */}
          {step === 'REQUEST' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Permanent Account &amp; Data Erasure</span>
                </div>
                <p className="leading-relaxed">
                  Enter the email and name you used during registration or booking. We will verify your identity by sending a 6-digit one-time code to that email.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-500" />
                    Full Name (as registered) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aryan Dewade"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl bg-zinc-50 border border-zinc-300 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-500" />
                    Registered Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. aryan@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl bg-zinc-50 border border-zinc-300 px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={resetModal}
                  className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying account...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: OTP Verification Form */}
          {step === 'VERIFY' && (
            <form onSubmit={handleVerifyAndDelete} className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <Mail className="w-4 h-4 text-emerald-600" />
                  <span>Verification Code Dispatched</span>
                </div>
                <p>
                  A 6-digit code has been sent to <strong>{email}</strong>. Please check your inbox (and spam folder) and enter it below to confirm deletion.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-zinc-500" />
                    Enter 6-Digit OTP Code
                  </span>
                  <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-red-500" />
                    Expires in {formatTime(countdown)}
                  </span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  required
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-center tracking-[12px] font-mono text-xl sm:text-2xl font-bold rounded-2xl bg-zinc-50 border border-zinc-300 py-3 text-zinc-900 focus:bg-white focus:outline-none focus:border-red-500 transition-colors"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1">
                <p className="font-semibold text-zinc-900">• What will be deleted:</p>
                <p className="text-[11px] text-zinc-500">
                  Account profile, login credentials, booking history, personal session notes, and contact records.
                </p>
                <p className="font-semibold text-zinc-900 pt-1">• What will be preserved:</p>
                <p className="text-[11px] text-zinc-500">
                  Reviews and rating feedback you submitted will be preserved anonymously without personal user links.
                </p>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep('REQUEST')}
                  className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Change email</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={resetModal}
                    className="px-3.5 py-2 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Deleting data...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        <span>Permanently Delete Data</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: Success Confirmation */}
          {step === 'SUCCESS' && successInfo && (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-4 border-emerald-50">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h4 className="font-display text-xl font-bold text-zinc-900">
                  Data Erased Successfully
                </h4>
                <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                  Your personal data and account records have been permanently removed from ENGIPLEX Consultation.
                </p>
              </div>

              {/* Audit Record Summary Box */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-left text-xs space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-200 pb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Erasure Audit Certificate</span>
                </div>

                <div className="flex justify-between items-center text-zinc-700">
                  <span className="text-zinc-500">User Name:</span>
                  <span className="font-semibold text-zinc-900">{successInfo.userName}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-700">
                  <span className="text-zinc-500">Registered Email:</span>
                  <span className="font-mono text-zinc-900">{successInfo.email}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-700">
                  <span className="text-zinc-500">Data Creation Time:</span>
                  <span className="font-semibold text-zinc-900">{successInfo.creationDate}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-700">
                  <span className="text-zinc-500">Data Deletion Time:</span>
                  <span className="font-bold text-emerald-700">{successInfo.deletionDate}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-700 border-t border-zinc-200 pt-1.5">
                  <span className="text-zinc-500">Feedback / Reviews:</span>
                  <span className="text-emerald-700 font-semibold">Preserved (Anonymized)</span>
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-900">
                ✉️ A formal confirmation email with this audit record has been sent to <strong>{successInfo.email}</strong>.
              </div>

              <button
                onClick={resetModal}
                className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm shadow-md transition-colors"
              >
                Close &amp; Return to Home
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

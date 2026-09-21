import React, { useState } from 'react';
import { ShieldCheck, CreditCard, AlertCircle, Loader2, X, Smartphone, CheckCircle2 } from 'lucide-react';

interface RazorpayModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderId: string;
    amount: number; // in paise
    currency: string;
    bookingId: string;
    consultantName: string;
    date: string;
    startTime: string;
  };
  onSuccess: (paymentId: string, signature: string) => void;
  onFailure: (errorMessage: string) => void;
}

export const RazorpayModal: React.FC<RazorpayModalProps> = ({
  isOpen,
  onClose,
  orderData,
  onSuccess,
  onFailure,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'upi' | 'card'>('upi');
  const [upiId, setUpiId] = useState('user@okaxis');
  const [cardNumber, setCardNumber] = useState('4111 •••• •••• 1111');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulateSuccess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const paymentId = `pay_${Math.random().toString(36).substring(2, 12)}`;
      onSuccess(paymentId, 'simulated_valid_signature');
    }, 1200);
  };

  const handleSimulateFailure = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onFailure('Payment was declined by issuing bank (Test Simulation).');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Razorpay Header */}
        <div className="bg-gradient-to-r from-blue-950/60 to-indigo-950/40 p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-lg">
              ₹
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Razorpay Secure Checkout
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                  Sandbox Active
                </span>
              </div>
              <p className="text-sm font-semibold text-zinc-100 mt-0.5">ENGIPLEX Consultation Platform</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-zinc-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount & Summary banner */}
        <div className="p-5 bg-zinc-950/50 border-b border-zinc-800/80">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-zinc-400">Total Consultation Fee</span>
            <span className="text-2xl font-bold tracking-tight text-emerald-400">
              ₹{orderData.amount / 100}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800/60 text-xs text-zinc-400 flex items-center justify-between">
            <span>Session with <strong className="text-zinc-200">{orderData.consultantName}</strong></span>
            <span>{orderData.date} • {orderData.startTime}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-5 space-y-4">
          <div className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Select Payment Method
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setSelectedMethod('upi')}
              className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                selectedMethod === 'upi'
                  ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <div className="text-xs font-medium">UPI / QR</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMethod('card')}
              className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                selectedMethod === 'card'
                  ? 'border-emerald-500 bg-emerald-950/20 text-emerald-300'
                  : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <div className="text-xs font-medium">Card Payment</div>
            </button>
          </div>

          {selectedMethod === 'upi' ? (
            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80">
              <label className="block text-[11px] text-zinc-400 mb-1">UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          ) : (
            <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800/80 space-y-2">
              <div>
                <label className="block text-[11px] text-zinc-400 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  defaultValue="12/28"
                  className="bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono"
                />
                <input
                  type="password"
                  defaultValue="•••"
                  className="bg-zinc-900 border border-zinc-700/70 rounded-lg px-3 py-2 text-xs text-zinc-200 font-mono"
                />
              </div>
            </div>
          )}

          {/* Action Simulation Buttons */}
          <div className="pt-2 space-y-2.5">
            <button
              onClick={handleSimulateSuccess}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-zinc-950 font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying with Razorpay...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Pay ₹{orderData.amount / 100} & Confirm Booking
                </>
              )}
            </button>

            <button
              onClick={handleSimulateFailure}
              disabled={isProcessing}
              className="w-full py-2 px-3 rounded-lg border border-red-500/20 bg-red-950/10 hover:bg-red-950/30 text-red-400 text-xs font-medium transition-colors"
            >
              Simulate Failed / Declined Payment (Test Error Handling)
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400 pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-bit encrypted • Razorpay verified merchant</span>
          </div>
        </div>
      </div>
    </div>
  );
};

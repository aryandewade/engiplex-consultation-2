import React from 'react';
import { X, Printer, CheckCircle, Download, Calendar, Clock, User, Shield } from 'lucide-react';
import { Booking } from '../types';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, booking }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const consultantName = typeof booking.consultantId === 'object' ? booking.consultantId?.name : 'Mentor';
  const customerName = typeof booking.userId === 'object' ? booking.userId?.name : 'Client';
  const customerEmail = typeof booking.userId === 'object' ? booking.userId?.email : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white">
      <div className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden print:border-none print:shadow-none print:text-black">
        {/* Actions bar */}
        <div className="p-4 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Official Tax Invoice & Receipt
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-zinc-800 p-1.5 rounded-lg hover:bg-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 sm:p-8 space-y-6 text-zinc-900 print:text-black bg-white">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-zinc-200 pb-6">
            <div>
              <img
                src="/engiplex-logo.png"
                alt="ENGIPLEX Consultation"
                className="h-9 w-auto object-contain mb-1"
              />
              <p className="text-xs text-zinc-500 print:text-zinc-600 mt-0.5">
                Premier Advisory & Mentorship Platform
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                <CheckCircle className="w-3 h-3" /> PAID & CONFIRMED
              </span>
              <p className="text-[11px] text-zinc-500 mt-1.5 font-mono">
                {booking.receiptId || 'REC-UNKNOWN'}
              </p>
            </div>
          </div>

          {/* Parties involved */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
                Billed To (Client)
              </span>
              <p className="font-bold text-zinc-900 print:text-black mt-1 text-sm">{customerName}</p>
              {customerEmail && <p className="text-zinc-500 print:text-zinc-600">{customerEmail}</p>}
            </div>
            <div className="text-right">
              <span className="text-zinc-400 uppercase tracking-wider font-semibold text-[10px]">
                Advisor / Consultant
              </span>
              <p className="font-bold text-zinc-900 print:text-black mt-1 text-sm">{consultantName}</p>
              <p className="text-zinc-500 print:text-zinc-600">Verified Mentor</p>
            </div>
          </div>

          {/* Session Details */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-4 space-y-2.5 text-xs print:bg-zinc-50 print:border-zinc-300">
            <div className="flex justify-between py-1 border-b border-zinc-200">
              <span className="text-zinc-500">Scheduled Date</span>
              <span className="font-semibold text-zinc-900 print:text-black">{booking.date}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200">
              <span className="text-zinc-500">Time Slot</span>
              <span className="font-semibold text-zinc-900 print:text-black">
                {booking.startTime} – {booking.endTime}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200">
              <span className="text-zinc-500">Duration</span>
              <span className="font-medium text-zinc-900 print:text-black">20 min focused consultation</span>
            </div>
            <div className="flex justify-between py-1 border-b border-zinc-200">
              <span className="text-zinc-500">Payment / Auth</span>
              <span className="font-mono text-zinc-700 print:text-black">
                {booking.promoCode === 'Engistud' || booking.isVerifiedStudent
                  ? 'WAIVER: Student Fee Waiver'
                  : (booking.razorpayPaymentId || 'pay_verified')}
              </span>
            </div>
            <div className="flex justify-between py-1 pt-2 text-sm">
              <span className="font-bold text-zinc-900 print:text-black">Total Paid</span>
              <span className="font-black text-emerald-700">
                {booking.amount === 0 ? '₹0 (FREE)' : `₹${booking.amount}/-`}
              </span>
            </div>
          </div>

          {/* Footer note */}
          <div className="text-[11px] text-zinc-500 space-y-1 pt-2 border-t border-zinc-200">
            <p>• Rescheduling allowed up to 12 hours prior to the appointment.</p>
            <p>• Secure Google Meet link dispatched to: {customerEmail || 'your email'}.</p>
            <p className="text-zinc-400 font-mono text-[10px]">Booking Reference: {booking._id}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

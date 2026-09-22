import React, { useEffect } from 'react';
import {
  FileText,
  ArrowLeft,
  ShieldCheck,
  UserCheck,
  Briefcase,
  CreditCard,
  Clock,
  RotateCcw,
  Calendar,
  Lock,
  AlertTriangle,
  Award,
  Scale,
  CloudOff,
  UserX,
  RefreshCw,
  Landmark,
  Mail,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
} from 'lucide-react';

interface TermsAndConditionsProps {
  onNavigate: (path: string) => void;
}

export const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({ onNavigate }) => {
  useEffect(() => {
    if (window.location.hash === '#refund-policy') {
      setTimeout(() => {
        const el = document.getElementById('refund-policy');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="w-[94%] sm:w-[82%] max-w-5xl mx-auto py-8 sm:py-12 space-y-10 animate-fade-in text-zinc-900">
      {/* Back to home button */}
      <button
        onClick={() => onNavigate('/')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Official Legal Terms</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Terms &amp; Conditions
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
            These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use of ENGIPLEX Consultation&#39;s website and consultancy booking services (the &quot;Platform&quot;, &quot;Services&quot;). By registering on the Platform, booking a session, or making a payment, you agree to be legally bound by these Terms. If you do not agree, please do not use the Platform.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-zinc-400">
            <span>Platform: <strong className="text-white">ENGIPLEX Consultation</strong></span>
            <span>•</span>
            <span>Last Updated: <strong className="text-white">September 2026</strong></span>
            <span>•</span>
            <span>Jurisdiction: <strong className="text-white">India</strong></span>
          </div>
        </div>
      </div>

      {/* Cross Reference Alert to Privacy Policy */}
      <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-5 text-xs sm:text-sm text-emerald-950 flex items-start justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            These Terms should be read together with our{' '}
            <button
              onClick={() => onNavigate('/privacy')}
              className="font-bold text-emerald-800 underline hover:text-emerald-950 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            , which governs how we collect, store, and process your personal data in compliance with the Digital Personal Data Protection (DPDP) Act, 2023.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/privacy')}
          className="hidden sm:inline-flex shrink-0 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
        >
          View Privacy Policy
        </button>
      </div>

      {/* Content Sections */}
      <div className="space-y-8 text-sm leading-relaxed text-zinc-700">
        
        {/* Section 1: Eligibility */}
        <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2.5">
            <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>1. Eligibility</span>
          </h2>
          <div className="space-y-3 pl-1 text-zinc-600">
            <p>
              <strong className="text-zinc-900">1.1 Age Requirement:</strong> You must be at least 18 years old to independently register and transact on the Platform. Users below 18 (e.g., college students or freshers under legal age) may use the Platform only with the consent and supervision of a parent or legal guardian, who shall be responsible for the booking and payment.
            </p>
            <p>
              <strong className="text-zinc-900">1.2 Accuracy of Information:</strong> By registering, you confirm that all information provided (name, email address, mobile number, college name, student ID, graduation year, etc.) is true, accurate, current, and complete. Providing misleading or forged documentation may lead to account suspension without refund.
            </p>
          </div>
        </section>

        {/* Section 2: Nature of Services */}
        <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2.5">
            <Briefcase className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>2. Nature of Services</span>
          </h2>
          <div className="space-y-3 pl-1 text-zinc-600">
            <p>
              <strong className="text-zinc-900">2.1 Live Consultation Slots:</strong> The Platform allows users to book a paid, 1-on-1 consultation slot with a verified engineering or career consultant, conducted live over Google Meet.
            </p>

            <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950 space-y-2">
              <p className="font-bold flex items-center gap-2 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>2.2 No Guarantee of Employment or Outcome</span>
              </p>
              <p className="text-xs sm:text-sm text-amber-900/90 leading-relaxed">
                All sessions, advice, feedback, resume reviews, roadmap suggestions, and guidance provided by consultants are <strong>suggestions and recommendations only</strong>. They do not constitute, and must not be treated as, a guarantee, promise, or assurance of:
              </p>
              <ul className="list-disc list-inside text-xs sm:text-sm space-y-1 pl-2 text-amber-900/90">
                <li>A job offer, interview call, placement, or employment of any kind.</li>
                <li>Any specific academic grade, professional promotion, or career outcome.</li>
              </ul>
              <p className="text-xs text-amber-900/80 pt-1">
                The Platform, the Company, and its consultants shall not be held liable for any employment-related or career-related decision, outcome, or consequence arising from a session.
              </p>
            </div>

            <p>
              <strong className="text-zinc-900">2.3 Independent Professional Opinions:</strong> Consultants provide guidance based on their independent professional judgment and industry experience. Any opinions expressed during sessions are those of the individual consultant and not a representation or warranty by the Company.
            </p>
          </div>
        </section>

        {/* Section 3: Booking & Payment */}
        <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2.5">
            <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>3. Booking &amp; Payment</span>
          </h2>
          <div className="space-y-3 pl-1 text-zinc-600">
            <p>
              <strong className="text-zinc-900">3.1 Payment Gateway Confirmation:</strong> A consultation slot is confirmed only after successful payment clearance through our authorized payment gateway partner, <strong>Razorpay</strong>.
            </p>
            <p>
              <strong className="text-zinc-900">3.2 Payment Data Security:</strong> The Company does not store your debit card, credit card, UPI PIN, or net-banking credentials; these are handled directly, securely, and in an encrypted manner by Razorpay under PCI-DSS standards.
            </p>
            <p>
              <strong className="text-zinc-900">3.3 Instant Delivery of Session Details:</strong> Booking confirmations, official tax receipts, and the unique Google Meet appointment link are delivered to you immediately via on-screen receipt and email after successful payment.
            </p>
            <p>
              <strong className="text-zinc-900">3.4 Transparent Pricing:</strong> Prices for consultation sessions are as displayed on the Platform at the time of booking (e.g., standard ₹999/- per hour, or Pay What You Can for verified students using valid coupon codes) and are subject to change for future bookings without affecting sessions already booked and paid for.
            </p>
          </div>
        </section>

        {/* Section 4: Attendance, Rescheduling & No-Show Policy */}
        <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>4. Attendance, Rescheduling &amp; No-Show Policy</span>
          </h2>
          <div className="space-y-3 pl-1 text-zinc-600">
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
              <p>
                <strong className="text-zinc-900">4.1 Consultant Waiting Period:</strong> If the consultant joins the Google Meet at the scheduled appointment time but the user does not join, the consultant will wait for exactly <strong>10 (ten) minutes</strong> from the scheduled start time.
              </p>
              <p>
                <strong className="text-zinc-900">4.2 User No-Show:</strong> If the user fails to join the session within this 10-minute waiting window, the session will be recorded and marked as a <strong>&quot;No-Show&quot;</strong>, the session will be treated as delivered, and <strong>no refund</strong> will be provided.
              </p>
            </div>
            <p>
              <strong className="text-zinc-900">4.3 Technical Readiness:</strong> Users are strongly advised to join the Google Meet room at least 5 minutes before the scheduled time and to verify their internet connection, camera, and microphone in advance.
            </p>
          </div>
        </section>

        {/* Section 5: Refund & Cancellation Policy */}
        <section
          id="refund-policy"
          className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5 scroll-mt-24"
        >
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2.5">
            <RotateCcw className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>5. Refund &amp; Cancellation Policy</span>
          </h2>
          <p className="text-zinc-600">
            The Company follows a limited, clearly defined refund policy as set out below. Except as expressly stated in this Section, <strong className="text-zinc-900">all payments made on the Platform are non-refundable.</strong>
          </p>

          {/* Refund Scenarios Table */}
          <div className="overflow-x-auto border border-zinc-200 rounded-xl shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-zinc-100 text-zinc-800 border-b border-zinc-200 font-bold uppercase tracking-wider">
                  <th className="p-3 sm:p-4 w-3/5">Scenario</th>
                  <th className="p-3 sm:p-4 w-2/5">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                <tr className="hover:bg-zinc-50/70 transition-colors">
                  <td className="p-3 sm:p-4 font-medium text-zinc-900">
                    <strong>No consultant is available</strong> for the booked slot (Company / Platform-side failure)
                  </td>
                  <td className="p-3 sm:p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Full refund
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-zinc-50/70 transition-colors">
                  <td className="p-3 sm:p-4 font-medium text-zinc-900">
                    <strong>User does not join</strong> within the consultant&#39;s 10-minute waiting period (Section 4)
                  </td>
                  <td className="p-3 sm:p-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      No refund
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-zinc-50/70 transition-colors">
                  <td className="p-3 sm:p-4 font-medium text-zinc-900">
                    <strong>Consultant-side technical / network issue</strong> prevents the session from being conducted
                  </td>
                  <td className="p-3 sm:p-4 space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      Next Available Slot Free
                    </span>
                    <p className="text-[11px] text-zinc-500">
                      User will be allotted the next available slot at no additional cost. No refund will be issued.
                    </p>
                  </td>
                </tr>

                <tr className="hover:bg-zinc-50/70 transition-colors">
                  <td className="p-3 sm:p-4 font-medium text-zinc-900">
                    <strong>User-side technical / network issue</strong> prevents the session from being conducted
                  </td>
                  <td className="p-3 sm:p-4 space-y-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      No refund
                    </span>
                    <p className="text-[11px] text-zinc-500">
                      No automatic rescheduling. Users may request a paid rebooking, at the Company&#39;s discretion.
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-3 pl-1 text-zinc-600 pt-2">
            <p>
              <strong className="text-zinc-900">5.1 Refund Timeline:</strong> Where a refund is applicable under this Policy, it will be processed and credited back to the original payment method within <strong>48 (forty-eight) hours</strong> of the refund being approved. Actual credit to your bank/UPI account may take additional time depending on your bank&#39;s or Razorpay&#39;s clearing cycles, which are outside the Company&#39;s control.
            </p>
            <p>
              <strong className="text-zinc-900">5.2 Refund Request Process:</strong> To request a refund or report a dispute, users must contact our support team at <a href="mailto:support@engiplex.com" className="text-emerald-700 font-semibold underline">support@engiplex.com</a> within 24 hours of the scheduled session, along with the Booking ID and transaction details.
            </p>
            <p>
              <strong className="text-zinc-900">5.3 Verification:</strong> The Company reserves the right to verify the reported issue (e.g., through meeting log analysis, server timestamps, or consultant confirmation) before approving a refund or reschedule.
            </p>
          </div>
        </section>

        {/* Section 6: Rescheduling by the Company */}
        <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2.5">
            <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>6. Rescheduling by the Company</span>
          </h2>
          <div className="space-y-3 pl-1 text-zinc-600">
            <p>
              The Company reserves the right to reschedule a session due to consultant unavailability, emergency medical situations, technical issues, or unforeseen circumstances, and will offer the user an alternate slot at no extra cost. If no suitable alternate slot is available or acceptable to the user, a full refund will be processed as per Section 5.1.
            </p>
          </div>
        </section>

        {/* Section 7: User Data & Consent */}
        <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2.5">
            <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>7. User Data &amp; Consent</span>
          </h2>
          <div className="space-y-3 pl-1 text-zinc-600">
            <p>
              <strong className="text-zinc-900">7.1 Consent to Process Data:</strong> By registering on and using the Platform, the user expressly <strong>consents to the collection, processing, and storage</strong> of their personal data (including name, email address, mobile number, student ID, graduation year, and session feedback) as described in our{' '}
              <button
                onClick={() => onNavigate('/privacy')}
                className="text-emerald-700 font-semibold underline cursor-pointer hover:text-emerald-900"
              >
                Privacy Policy
              </button>
              .
            </p>
            <p>
              <strong className="text-zinc-900">7.2 Data Security Standards:</strong> The Company shall take reasonable technical and organizational measures to keep this data <strong>safe and secure on the Company&#39;s systems/servers</strong>, in line with the security practices described in the Privacy Policy and applicable law, including the Digital Personal Data Protection Act, 2023 and the IT Act, 2000.
            </p>
            <p>
              <strong className="text-zinc-900">7.3 Electronic Transmission Limitations:</strong> While the Company takes reasonable security measures, no method of electronic storage or transmission over the internet is 100% secure, and the Company cannot guarantee absolute security.
            </p>
          </div>
        </section>

        {/* Section 8: User Conduct */}
        <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>8. User Conduct</span>
          </h2>
          <div className="space-y-3 pl-1 text-zinc-600">
            <p>Users agree not to:</p>
            <ul className="list-disc list-inside space-y-1.5 pl-2 text-zinc-600">
              <li>Provide false, misleading, or impersonated information during registration or student verification.</li>
              <li>Record, screen-capture, reproduce, or redistribute a consultation session or any part thereof without prior written consent from both the Company and the consultant.</li>
              <li>Use the Platform for any unlawful, abusive, defamatory, or fraudulent purpose.</li>
              <li>Harass, threaten, or behave inappropriately toward a consultant or company representative.</li>
            </ul>
            <p className="text-xs text-rose-700 font-medium pt-1">
              Violation of this Section may result in immediate suspension or termination of the user&#39;s account without refund.
            </p>
          </div>
        </section>

        {/* Section 9: Consultant Conduct & Confidentiality */}
        <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>9. Consultant Conduct &amp; Confidentiality</span>
          </h2>
          <div className="space-y-3 pl-1 text-zinc-600">
            <p>
              Consultants are independently engaged industry professionals bound by a separate service agreement with the Company, including strict obligations of confidentiality, professionalism, and non-disclosure of any sensitive technical information or career aspirations shared by users during a consultation session.
            </p>
          </div>
        </section>

        {/* Section 10: Intellectual Property */}
        <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2.5">
            <Award className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>10. Intellectual Property</span>
          </h2>
          <div className="space-y-3 pl-1 text-zinc-600">
            <p>
              All content on the Platform — including logos, branding, typography, text, website design, UI components, curated roadmaps, and course/session materials provided by the Company — is the exclusive property of ENGIPLEX and may not be copied, reproduced, reverse-engineered, or distributed without prior written permission.
            </p>
          </div>
        </section>

        {/* Section 11: Limitation of Liability */}
        <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>11. Limitation of Liability</span>
          </h2>
          <div className="space-y-3 pl-1 text-zinc-600">
            <p>
              <strong className="text-zinc-900">11.1 &quot;As-Is&quot; Basis:</strong> The Platform is provided on an &quot;as-is&quot; and &quot;as-available&quot; basis. The Company does not warrant uninterrupted or error-free access to the Platform or Google Meet (which is an independent third-party service).
            </p>
            <p>
              <strong className="text-zinc-900">11.2 Maximum Cap:</strong> To the maximum extent permitted by law, the Company&#39;s total liability arising out of any booking shall not exceed the amount actually paid by the user for that specific session.
            </p>
            <p>
              <strong className="text-zinc-900">11.3 Consequential Damages Exclusion:</strong> The Company is not liable for any indirect, incidental, punitive, or consequential loss, including loss of career opportunity, job offer revocation, or loss of anticipated revenue, arising from use of the Services.
            </p>
          </div>
        </section>

        {/* Section 12: Force Majeure */}
        <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2.5">
            <CloudOff className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>12. Force Majeure</span>
          </h2>
          <div className="space-y-3 pl-1 text-zinc-600">
            <p>
              The Company shall not be held liable for any failure or delay in performance caused by circumstances beyond its reasonable control, including internet service provider outages, power grid failures, telecommunication strikes, natural disasters, epidemics, war, or government directives.
            </p>
          </div>
        </section>

        {/* Section 13: Termination */}
        <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2.5">
            <UserX className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>13. Termination</span>
          </h2>
          <div className="space-y-3 pl-1 text-zinc-600">
            <p>
              The Company reserves the right to suspend or terminate any user&#39;s account for violation of these Terms, fraudulent activity, student ID forgery, or misuse of the Platform, without prior notice and without refund of any amount already paid for completed or no-show sessions.
            </p>
          </div>
        </section>

        {/* Section 14: Amendments */}
        <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2.5">
            <RefreshCw className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>14. Amendments</span>
          </h2>
          <div className="space-y-3 pl-1 text-zinc-600">
            <p>
              The Company may revise these Terms from time to time. The updated version will be posted on this page with a revised &quot;Last Updated&quot; date. Continued use of the Platform after such changes constitutes your acceptance of the revised Terms.
            </p>
          </div>
        </section>

        {/* Section 15: Governing Law & Dispute Resolution */}
        <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2.5">
            <Landmark className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>15. Governing Law &amp; Dispute Resolution</span>
          </h2>
          <div className="space-y-3 pl-1 text-zinc-600">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of India. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in India.
            </p>
          </div>
        </section>

        {/* Section 16: Grievance Redressal */}
        <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>16. Grievance Redressal</span>
          </h2>
          <div className="space-y-3 pl-1 text-zinc-600">
            <p>
              In accordance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act, 2023, for any complaints, disputes, or grievances, please contact our Grievance Officer:
            </p>
            <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 text-xs space-y-2 max-w-md">
              <p><strong className="text-zinc-900">Grievance Officer:</strong> Legal &amp; Grievance Cell</p>
              <p>
                <strong className="text-zinc-900">Email:</strong>{' '}
                <a href="mailto:grievance@engiplex.com" className="text-emerald-700 underline font-semibold">
                  grievance@engiplex.com
                </a>
              </p>
              <p><strong className="text-zinc-900">Address:</strong> Registered Office, ENGIPLEX Consultation, India</p>
              <p className="text-zinc-500 pt-1">
                <strong className="text-zinc-900">Response Time:</strong> Complaints will be acknowledged within <strong>24–48 hours</strong> and resolved within <strong>15–30 days</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Section 17: Contact Us */}
        <section className="bg-white border border-zinc-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-zinc-900 flex items-center gap-2.5">
            <Mail className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>17. Contact Us</span>
          </h2>
          <div className="space-y-3 pl-1 text-zinc-600">
            <p>If you have any questions about these Terms &amp; Conditions, please reach out to our team:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1 text-xs">
                <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-emerald-600" />
                  Support Email
                </span>
                <a href="mailto:support@engiplex.com" className="text-emerald-700 font-semibold underline block">
                  support@engiplex.com
                </a>
              </div>
              <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1 text-xs">
                <span className="font-bold text-zinc-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  Registered Office
                </span>
                <p className="text-zinc-600">ENGIPLEX Consultation, India</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

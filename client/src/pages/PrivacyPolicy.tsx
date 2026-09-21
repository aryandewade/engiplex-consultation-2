import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  FileText,
  UserCheck,
  CreditCard,
  Video,
  Globe,
  Database,
  Mail,
  Scale,
  AlertCircle,
  HelpCircle,
  Trash2,
} from 'lucide-react';
import { DeleteDataModal } from '../components/DeleteDataModal';

interface PrivacyPolicyProps {
  onNavigate: (path: string) => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onNavigate }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="w-[94%] sm:w-[82%] max-w-5xl mx-auto py-8 sm:py-12 space-y-10 animate-fade-in text-zinc-900">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('/consultants')}
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-zinc-900 hover:underline cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-all shadow-2xs cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
          <span>Delete My Data (Right to Erasure)</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-950 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>DPDP Act, 2023 & IT Rules Compliant</span>
            </div>

            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 hover:bg-red-500/30 text-xs font-bold tracking-wide transition-colors cursor-pointer"
            >
              <Trash2 className="w-3 h-3 text-red-400" />
              <span>Self-Service Data Deletion</span>
            </button>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Privacy Policy
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
            This Policy explains what personal data we collect from you when you use our consultancy booking website (the &quot;Services&quot;), why we collect it, how we use, store, share, and protect it, and what rights you have over it.
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

      {/* Acceptance notice */}
      <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-5 text-xs sm:text-sm text-emerald-950 flex items-start gap-3 shadow-xs">
        <AlertCircle className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          By registering on the Platform, booking a consultation slot, or making a payment, you agree to the collection and use of your data as described in this Policy. If you do not agree, please do not use the Platform.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-12 leading-relaxed text-zinc-700 text-sm">

        {/* 1. Who We Are */}
        <section id="data-fiduciary" className="space-y-4">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <Scale className="w-5 h-5 text-emerald-600" />
            <h2>1. Who We Are (Data Fiduciary)</h2>
          </div>
          <p>
            Under the Digital Personal Data Protection (DPDP) Act, 2023, <strong>ENGIPLEX Consultation</strong> acts as the Data Fiduciary — the entity that decides why and how your personal data is processed.
          </p>
          <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-xs sm:text-sm space-y-2 font-mono text-zinc-800">
            <div><strong className="font-sans text-zinc-600">Legal Entity Name:</strong> ENGIPLEX Consultation Services</div>
            <div><strong className="font-sans text-zinc-600">Registered Address:</strong> India</div>
            <div><strong className="font-sans text-zinc-600">Contact Email:</strong> support@engiplex.com</div>
            <div><strong className="font-sans text-zinc-600">Grievance Officer / Data Protection Contact:</strong> grievance@engiplex.com (mandatory under DPDP Act & IT Rules)</div>
          </div>
        </section>

        {/* 2. What Personal Data We Collect */}
        <section id="data-collected" className="space-y-4 border-t border-zinc-100 pt-8">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <Database className="w-5 h-5 text-emerald-600" />
            <h2>2. What Personal Data We Collect</h2>
          </div>
          <p>
            We collect only the data needed to provide the booking, consultation, and payment services.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                2.1 Identity &amp; Contact Data
              </h3>
              <ul className="list-disc list-inside text-xs sm:text-sm text-zinc-600 space-y-1">
                <li>Full name</li>
                <li>Email address</li>
                <li>Mobile number</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                2.2 Academic / Professional Data
              </h3>
              <ul className="list-disc list-inside text-xs sm:text-sm text-zinc-600 space-y-1">
                <li>Student ID (for student users seeking fee waivers)</li>
                <li>Graduation year (for student users)</li>
                <li>Professional details, where provided by working-professional users</li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                2.3 Feedback Data
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600">
                Feedback and ratings submitted after a session, collected separately for students and working professionals.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                2.4 Payment Data
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600">
                Transaction ID, payment status, amount, and slot booking reference.
              </p>
              <p className="text-xs text-zinc-500 bg-white p-2.5 rounded-xl border border-zinc-200">
                🔒 <strong>PCI-DSS Compliance:</strong> We do not collect or store your card number, UPI ID, CVV, or net-banking credentials. These are collected and processed directly by our payment gateway partner, <strong>Razorpay</strong>, which is independently PCI-DSS compliant.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-600" />
                2.5 Session Data
              </h3>
              <ul className="list-disc list-inside text-xs sm:text-sm text-zinc-600 space-y-1">
                <li>Booking date, time slot, and consultant assigned</li>
                <li>Google Meet link generated for the session</li>
              </ul>
              <p className="text-xs text-zinc-500 italic">
                We do not record, store, or access the content of your live Google Meet consultation unless you are separately informed and asked for explicit consent.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-600" />
                2.6 Technical Data
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600">
                IP address, browser type, device information, and essential cookies for session handling (see Section 9).
              </p>
            </div>
          </div>
        </section>

        {/* 3. Why We Collect Your Data */}
        <section id="purposes" className="space-y-4 border-t border-zinc-100 pt-8">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h2>3. Why We Collect Your Data (Purpose &amp; Lawful Basis)</h2>
          </div>
          <p>
            Under the DPDP Act, we process your data only for specified, lawful purposes and only with your consent, including to:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-zinc-700">
            <li className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Create and manage your user account
            </li>
            <li className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Process slot bookings and facilitate consultant assignment
            </li>
            <li className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Process payments securely through Razorpay
            </li>
            <li className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Generate and share Google Meet links for your session
            </li>
            <li className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Send booking confirmations, reminders, and receipts
            </li>
            <li className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Collect and analyze feedback to improve consultant quality
            </li>
            <li className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Respond to support queries and resolve grievances
            </li>
            <li className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Comply with legal, tax, and regulatory obligations
            </li>
            <li className="flex items-center gap-2 p-2 rounded-lg bg-zinc-50 border border-zinc-200 sm:col-span-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Prevent fraud and misuse of the Platform
            </li>
          </ul>
          <p className="text-xs text-zinc-500 italic">
            We do not use your data for any purpose beyond what you were informed of at the time of collection, without asking for fresh consent.
          </p>
        </section>

        {/* 4. Your Consent */}
        <section id="consent" className="space-y-4 border-t border-zinc-100 pt-8">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <UserCheck className="w-5 h-5 text-emerald-600" />
            <h2>4. Your Consent</h2>
          </div>
          <p>
            We collect your data only after you give free, specific, informed, unconditional, and unambiguous consent, as required under the DPDP Act.
          </p>
          <p>
            Consent is captured through clear checkboxes/actions at the time of registration and booking — not through pre-ticked boxes or bundled consent.
          </p>
          <p>
            You may withdraw your consent at any time, with the same ease with which it was given, by writing to our Grievance Officer. Withdrawal will not affect the lawfulness of processing carried out before withdrawal, and may result in us being unable to provide the Services (e.g., we cannot process a booking without your contact details).
          </p>
        </section>

        {/* 5. Data of Minors */}
        <section id="minors" className="space-y-4 border-t border-zinc-100 pt-8">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h2>5. Data of Minors</h2>
          </div>
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs sm:text-sm space-y-2">
            <p>
              If you are a student under 18 years of age, we require verifiable consent from your parent or lawful guardian before processing your personal data, as mandated under Section 9 of the DPDP Act.
            </p>
            <p>
              We do not knowingly undertake tracking, behavioural monitoring, or targeted advertising directed at children.
            </p>
          </div>
        </section>

        {/* 6. How We Share Your Data */}
        <section id="data-sharing" className="space-y-4 border-t border-zinc-100 pt-8">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <Globe className="w-5 h-5 text-emerald-600" />
            <h2>6. How We Share Your Data</h2>
          </div>
          <p>
            We do not sell your personal data. We share it only where necessary, with the following categories of recipients:
          </p>

          <div className="overflow-x-auto rounded-2xl border border-zinc-200 shadow-2xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-zinc-100/80 border-b border-zinc-200 text-zinc-900 font-bold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="p-3.5">Recipient</th>
                  <th className="p-3.5">Purpose</th>
                  <th className="p-3.5">Data Shared</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-700">
                <tr className="hover:bg-zinc-50/50">
                  <td className="p-3.5 font-semibold text-zinc-900">Razorpay (Payment Processor)</td>
                  <td className="p-3.5">To process your payment securely</td>
                  <td className="p-3.5 font-mono text-xs">Name, email, mobile, amount</td>
                </tr>
                <tr className="hover:bg-zinc-50/50">
                  <td className="p-3.5 font-semibold text-zinc-900">Assigned Consultant</td>
                  <td className="p-3.5">To conduct your 1-on-1 session</td>
                  <td className="p-3.5 font-mono text-xs">Name, email, relevant booking/feedback context</td>
                </tr>
                <tr className="hover:bg-zinc-50/50">
                  <td className="p-3.5 font-semibold text-zinc-900">Google Meet / Google Workspace</td>
                  <td className="p-3.5">To host your live session</td>
                  <td className="p-3.5 font-mono text-xs">Email, session time</td>
                </tr>
                <tr className="hover:bg-zinc-50/50">
                  <td className="p-3.5 font-semibold text-zinc-900">Government/Regulatory/Judicial Authorities</td>
                  <td className="p-3.5">Where legally required (e.g., under IT Act, court orders, tax law)</td>
                  <td className="p-3.5 font-mono text-xs">As mandated by law</td>
                </tr>
                <tr className="hover:bg-zinc-50/50">
                  <td className="p-3.5 font-semibold text-zinc-900">Service Providers (hosting, analytics, support tools)</td>
                  <td className="p-3.5">To operate the Platform</td>
                  <td className="p-3.5 font-mono text-xs">Limited technical/contact data, under confidentiality obligations</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500">
            All third parties we share data with are contractually bound to use it only for the stated purpose and to apply reasonable security safeguards.
          </p>
        </section>

        {/* 7. Cross-Border Data Transfer */}
        <section id="cross-border" className="space-y-3 border-t border-zinc-100 pt-8">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <Globe className="w-5 h-5 text-emerald-600" />
            <h2>7. Cross-Border Data Transfer</h2>
          </div>
          <p>
            Your data may be processed or stored on servers located outside India by our service providers (e.g., cloud hosting). As permitted under Section 16 of the DPDP Act, we may transfer personal data outside India, except to countries restricted by the Central Government. Such transfers will only occur under adequate contractual safeguards.
          </p>
        </section>

        {/* 8. Data Retention */}
        <section id="retention" className="space-y-3 border-t border-zinc-100 pt-8">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <Database className="w-5 h-5 text-emerald-600" />
            <h2>8. Data Retention</h2>
          </div>
          <p>
            We retain your personal data only for as long as necessary to fulfil the purposes described in this Policy, or as required by law (e.g., financial records under the Income Tax Act and GST law, typically retained for 6–8 years). Once the purpose is served and no legal retention obligation applies, your data will be securely deleted or anonymized.
          </p>
        </section>

        {/* 9. Cookies & Tracking Technologies */}
        <section id="cookies" className="space-y-3 border-t border-zinc-100 pt-8">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <Lock className="w-5 h-5 text-emerald-600" />
            <h2>9. Cookies &amp; Tracking Technologies</h2>
          </div>
          <p>We use cookies and similar technologies to:</p>
          <ul className="list-disc list-inside text-zinc-600 space-y-1 pl-2">
            <li>Keep you logged in during your session</li>
            <li>Remember booking preferences</li>
            <li>Understand Platform usage through analytics</li>
          </ul>
          <p className="text-xs text-zinc-500">
            You can control or disable cookies through your browser settings. Disabling essential cookies may affect booking functionality.
          </p>
        </section>

        {/* 10. Data Security */}
        <section id="security" className="space-y-3 border-t border-zinc-100 pt-8">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2>10. Data Security</h2>
          </div>
          <p>
            In line with Section 43A of the IT Act and the SPDI Rules, we implement reasonable security practices, including:
          </p>
          <ul className="list-disc list-inside text-zinc-600 space-y-1.5 pl-2">
            <li><strong>Encryption of data in transit:</strong> Protected via modern HTTPS / TLS 1.3 encryption.</li>
            <li><strong>Access controls:</strong> Granular internal role-based permissions limiting who can view your data.</li>
            <li><strong>Secure Payment Handling:</strong> Direct Razorpay integration where raw payment credentials never touch our servers.</li>
            <li><strong>Regular Audits:</strong> Continuous review of server and cloud infrastructure security practices.</li>
          </ul>
          <p className="text-xs text-zinc-500 italic">
            No system is 100% secure; however, we take industry-standard measures to protect your data from unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        {/* 11. Data Breach Notification */}
        <section id="breach" className="space-y-3 border-t border-zinc-100 pt-8">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <AlertCircle className="w-5 h-5 text-emerald-600" />
            <h2>11. Data Breach Notification</h2>
          </div>
          <p>
            In the event of a personal data breach that affects you, we will notify the Data Protection Board of India and affected users as required under the DPDP Act, describing the nature of the breach and the steps being taken to mitigate it.
          </p>
        </section>

        {/* 12. Your Rights as a Data Principal */}
        <section id="rights" className="space-y-4 border-t border-zinc-100 pt-8">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <Scale className="w-5 h-5 text-emerald-600" />
            <h2>12. Your Rights as a Data Principal</h2>
          </div>
          <p>Under the DPDP Act, you have the right to:</p>
          <div className="space-y-2.5">
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
              <strong className="text-zinc-900 block font-semibold text-xs sm:text-sm">Right to Access</strong>
              <span className="text-xs text-zinc-600">Obtain a summary of your personal data being processed and the processing activities undertaken.</span>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <strong className="text-zinc-900 block font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                    <Trash2 className="w-4 h-4 text-rose-600" />
                    Right to Erasure &amp; Self-Service Data Deletion
                  </strong>
                  <span className="text-xs text-zinc-600">
                    Directly delete your account profile, personal details, and consultation records using verified email authentication.
                  </span>
                </div>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white text-xs font-bold shadow-sm shadow-rose-600/20 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete My Data</span>
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
              <strong className="text-zinc-900 block font-semibold text-xs sm:text-sm">Right to Correction</strong>
              <span className="text-xs text-zinc-600">Request correction of inaccurate or incomplete personal information in your profile.</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
              <strong className="text-zinc-900 block font-semibold text-xs sm:text-sm">Right to Grievance Redressal</strong>
              <span className="text-xs text-zinc-600">Raise a complaint with our Grievance Officer and expect a response within a reasonable time.</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
              <strong className="text-zinc-900 block font-semibold text-xs sm:text-sm">Right to Nominate</strong>
              <span className="text-xs text-zinc-600">Nominate another individual to exercise your rights in the event of death or incapacity.</span>
            </div>
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
              <strong className="text-zinc-900 block font-semibold text-xs sm:text-sm">Right to Withdraw Consent</strong>
              <span className="text-xs text-zinc-600">Withdraw previously granted consent at any time, as described in Section 4.</span>
            </div>
          </div>
          <p className="text-xs text-zinc-600 pt-1">
            To exercise these rights or raise questions, click the <button onClick={() => setIsDeleteModalOpen(true)} className="text-rose-600 font-bold hover:underline">Delete My Data</button> button above or write to <strong className="text-zinc-900">grievance@engiplex.com</strong>. If unsatisfied with our resolution, you may approach the Data Protection Board of India.
          </p>
        </section>

        {/* 13. Consultant Confidentiality */}
        <section id="consultant-confidentiality" className="space-y-3 border-t border-zinc-100 pt-8">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <Lock className="w-5 h-5 text-emerald-600" />
            <h2>13. Consultant Confidentiality</h2>
          </div>
          <p>
            Consultants engaged on the Platform are contractually bound to maintain confidentiality of any personal or session-related information shared by users during a consultation, and are prohibited from using it for any purpose outside the scope of the session.
          </p>
        </section>

        {/* 14. Refunds, Cancellations & Payment Disputes */}
        <section id="refunds" className="space-y-3 border-t border-zinc-100 pt-8">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <CreditCard className="w-5 h-5 text-emerald-600" />
            <h2>14. Refunds, Cancellations &amp; Payment Disputes</h2>
          </div>
          <p>
            Payment, refund, and cancellation terms for bookings are governed separately by our Refund &amp; Cancellation Policy, which forms part of your agreement with us, in line with the Consumer Protection (E-Commerce) Rules, 2020.
          </p>
        </section>

        {/* 15. Third-Party Links */}
        <section id="links" className="space-y-3 border-t border-zinc-100 pt-8">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <Globe className="w-5 h-5 text-emerald-600" />
            <h2>15. Third-Party Links</h2>
          </div>
          <p>
            The Platform may contain links to third-party sites (e.g., Razorpay, Google Meet). We are not responsible for the privacy practices of these third parties, and we encourage you to review their respective privacy policies.
          </p>
        </section>

        {/* 16. Changes to This Policy */}
        <section id="changes" className="space-y-3 border-t border-zinc-100 pt-8">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h2>16. Changes to This Policy</h2>
          </div>
          <p>
            We may update this Policy periodically to reflect legal, technical, or business changes. The updated version will be posted on this page with a revised &quot;Last Updated&quot; date. Continued use of the Platform after changes constitutes acceptance of the revised Policy.
          </p>
        </section>

        {/* 17. Governing Law & Jurisdiction */}
        <section id="governing-law" className="space-y-3 border-t border-zinc-100 pt-8">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <Scale className="w-5 h-5 text-emerald-600" />
            <h2>17. Governing Law &amp; Jurisdiction</h2>
          </div>
          <p>
            This Policy is governed by the laws of India. Any disputes arising out of or in connection with this Policy shall be subject to the exclusive jurisdiction of the competent courts in India.
          </p>
        </section>

        {/* 18. Grievance Officer */}
        <section id="grievance-officer" className="space-y-4 border-t border-zinc-100 pt-8">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <Mail className="w-5 h-5 text-emerald-600" />
            <h2>18. Grievance Officer</h2>
          </div>
          <p>
            In accordance with the Information Technology Rules, 2011 and the DPDP Act, 2023, the details of our Grievance Officer are:
          </p>

          <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div>
              <span className="text-zinc-500 block text-[11px] uppercase font-bold tracking-wider">Name</span>
              <strong className="text-zinc-900">Grievance Redressal Officer</strong>
            </div>
            <div>
              <span className="text-zinc-500 block text-[11px] uppercase font-bold tracking-wider">Designation</span>
              <strong className="text-zinc-900">Data Protection &amp; Grievance Officer</strong>
            </div>
            <div>
              <span className="text-zinc-500 block text-[11px] uppercase font-bold tracking-wider">Email</span>
              <a href="mailto:grievance@engiplex.com" className="text-emerald-700 font-semibold hover:underline">
                grievance@engiplex.com
              </a>
            </div>
            <div>
              <span className="text-zinc-500 block text-[11px] uppercase font-bold tracking-wider">Response Time</span>
              <span className="text-zinc-800">Acknowledged within 24–48 hours; resolved within 15–30 days</span>
            </div>
          </div>
        </section>

        {/* 19. Contact Us */}
        <section id="contact-us" className="space-y-4 border-t border-zinc-100 pt-8">
          <div className="flex items-center gap-2.5 text-zinc-900 font-display text-lg sm:text-xl font-bold">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <h2>19. Contact Us</h2>
          </div>
          <p>
            If you have questions about this Privacy Policy or how your data is handled, please reach out to:
          </p>
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs sm:text-sm text-emerald-950 space-y-1">
            <div><strong>Platform:</strong> ENGIPLEX Consultation</div>
            <div><strong>Email:</strong> <a href="mailto:support@engiplex.com" className="font-semibold underline">support@engiplex.com</a></div>
            <div><strong>Website:</strong> <span className="font-semibold">engiplex.com</span></div>
          </div>
        </section>

      </div>

      {/* Back to top / home button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={() => onNavigate('/consultants')}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Homepage</span>
        </button>
      </div>

      {/* Interactive Delete My Data Modal */}
      <DeleteDataModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};

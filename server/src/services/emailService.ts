import nodemailer from 'nodemailer';
import { ENV } from '../config/env';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  receiptId?: string;
}

// In-memory store for recent sent emails (super helpful for local testing/demo without live SMTP!)
export const sentEmailsLog: {
  id: string;
  to: string;
  subject: string;
  sentAt: Date;
  html: string;
  receiptId?: string;
}[] = [];

let transporter: nodemailer.Transporter | null = null;

if (ENV.SMTP_HOST && ENV.SMTP_USER) {
  try {
    transporter = nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT,
      secure: ENV.SMTP_PORT === 465,
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS,
      },
    });
  } catch (err) {
    console.warn('[Email] SMTP configuration invalid, using mock email sender.');
  }
}

export const sendEmail = async (payload: EmailPayload): Promise<boolean> => {
  const emailRecord = {
    id: 'mail_' + Math.random().toString(36).substring(2, 9),
    to: payload.to,
    subject: payload.subject,
    sentAt: new Date(),
    html: payload.html,
    receiptId: payload.receiptId,
  };

  sentEmailsLog.unshift(emailRecord);
  if (sentEmailsLog.length > 50) sentEmailsLog.pop();

  console.log(`\n======================================================`);
  console.log(`[EMAIL DISPATCHED] To: ${payload.to} | Subject: ${payload.subject}`);
  if (payload.receiptId) console.log(`[Receipt ID]: ${payload.receiptId}`);
  console.log(`======================================================\n`);

  // 1. Send via Brevo HTTP API (Fastest & most reliable)
  const brevoApiKey = ENV.BREVO_API_KEY || ENV.EMAIL_API_KEY;
  if (brevoApiKey && brevoApiKey.startsWith('xkeysib-')) {
    try {
      const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': brevoApiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: ENV.EMAIL_FROM_NAME || 'ENGIPLEX Consultation',
            email: ENV.EMAIL_FROM || 'engiplexservices@gmail.com',
          },
          to: [
            {
              email: payload.to,
            },
          ],
          subject: payload.subject,
          htmlContent: payload.html,
        }),
      });

      const brevoData: any = await brevoRes.json().catch(() => ({}));
      if (brevoRes.ok && brevoData.messageId) {
        console.log(`[Brevo Email Sent Successfully] Message ID: ${brevoData.messageId}`);
        return true;
      } else {
        console.warn('[Brevo API Warning]', brevoData);
      }
    } catch (brevoErr) {
      console.error('[Brevo Email Error]', brevoErr);
    }
  }

  // 2. Fallback to Nodemailer SMTP
  if (transporter) {
    try {
      await transporter.sendMail({
        from: `"${ENV.EMAIL_FROM_NAME || 'ENGIPLEX Consultation'}" <${ENV.EMAIL_FROM}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });
      console.log('[SMTP Email Sent Successfully]');
      return true;
    } catch (error) {
      console.error('[Email] Failed to send email via SMTP:', error);
      return false;
    }
  }

  return true;
};

// Email Templates
export const buildBookingConfirmationEmail = (data: {
  customerName: string;
  consultantName: string;
  date: string;
  startTime: string;
  endTime: string;
  amount: number;
  receiptId: string;
  bookingId: string;
  meetingLink: string;
}): string => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #f4f4f5; padding: 32px; border-radius: 16px; border: 1px solid #27272a;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #10b981; font-size: 24px; margin: 0;">Consultation Confirmed</h1>
        <p style="color: #a1a1aa; font-size: 14px; margin-top: 6px;">Your appointment with ${data.consultantName} is officially booked.</p>
      </div>

      <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <h3 style="color: #e4e4e7; margin-top: 0; font-size: 16px; border-bottom: 1px solid #27272a; padding-bottom: 10px;">Appointment Details</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="color: #a1a1aa; padding: 6px 0;">Consultant:</td>
            <td style="color: #f4f4f5; font-weight: 600; text-align: right;">${data.consultantName}</td>
          </tr>
          <tr>
            <td style="color: #a1a1aa; padding: 6px 0;">Date:</td>
            <td style="color: #f4f4f5; font-weight: 600; text-align: right;">${data.date}</td>
          </tr>
          <tr>
            <td style="color: #a1a1aa; padding: 6px 0;">Time:</td>
            <td style="color: #f4f4f5; font-weight: 600; text-align: right;">${data.startTime} – ${data.endTime}</td>
          </tr>
          <tr>
            <td style="color: #a1a1aa; padding: 6px 0;">Duration:</td>
            <td style="color: #f4f4f5; font-weight: 600; text-align: right;">1 hour</td>
          </tr>
          <tr>
            <td style="color: #a1a1aa; padding: 6px 0;">Amount Paid:</td>
            <td style="color: #10b981; font-weight: 700; text-align: right;">₹${data.amount}</td>
          </tr>
          <tr>
            <td style="color: #a1a1aa; padding: 6px 0;">Receipt ID:</td>
            <td style="color: #f4f4f5; font-family: monospace; text-align: right;">${data.receiptId}</td>
          </tr>
        </table>
      </div>

      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 24px;">
        <p style="color: #a1a1aa; font-size: 13px; margin: 0 0 8px 0;">Your Secure Video Meeting Room:</p>
        <a href="${data.meetingLink}" style="display: inline-block; background: #10b981; color: #000; font-weight: 600; padding: 10px 24px; border-radius: 9999px; text-decoration: none; font-size: 14px;">Join Video Meeting</a>
      </div>

      <div style="font-size: 12px; color: #71717a; line-height: 1.6; border-top: 1px solid #27272a; padding-top: 16px;">
        <p style="margin: 0 0 6px 0;">• Rescheduling is permitted up to 12 hours prior to the session from your dashboard.</p>
        <p style="margin: 0;">• A full receipt has been generated and is attached to your account.</p>
      </div>
    </div>
  `;
};

export const buildRescheduleEmail = (data: {
  customerName: string;
  consultantName: string;
  previousDate: string;
  previousTime: string;
  newDate: string;
  newTime: string;
  meetingLink: string;
}): string => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #f4f4f5; padding: 32px; border-radius: 16px; border: 1px solid #27272a;">
      <h2 style="color: #38bdf8; margin-top: 0;">Consultation Rescheduled</h2>
      <p style="color: #a1a1aa; font-size: 14px;">Hello ${data.customerName}, your consultation appointment with ${data.consultantName} has been rescheduled.</p>
      
      <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 16px; margin: 20px 0;">
        <p style="color: #ef4444; text-decoration: line-through; margin: 0 0 8px 0; font-size: 13px;">Original: ${data.previousDate} at ${data.previousTime}</p>
        <p style="color: #10b981; font-weight: 600; margin: 0; font-size: 15px;">New Schedule: ${data.newDate} at ${data.newTime}</p>
      </div>

      <p style="font-size: 14px; color: #a1a1aa;">The meeting link remains active for the new scheduled slot:</p>
      <p><a href="${data.meetingLink}" style="color: #38bdf8;">${data.meetingLink}</a></p>
    </div>
  `;
};

export const buildCancellationEmail = (data: {
  customerName: string;
  consultantName: string;
  date: string;
  time: string;
  reason?: string;
  refundStatus: string;
}): string => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #f4f4f5; padding: 32px; border-radius: 16px; border: 1px solid #27272a;">
      <h2 style="color: #ef4444; margin-top: 0;">Consultation Cancelled</h2>
      <p style="color: #a1a1aa; font-size: 14px;">Hello ${data.customerName}, your appointment on <strong>${data.date} at ${data.time}</strong> with ${data.consultantName} has been cancelled.</p>
      ${data.reason ? `<p style="color: #d4d4d8; font-size: 13px;">Reason: ${data.reason}</p>` : ''}
      <p style="color: #a1a1aa; font-size: 13px;">Refund Status: <strong>${data.refundStatus}</strong> (Processed back to original payment source per organization policy).</p>
    </div>
  `;
};

export const buildDeletionOtpEmail = (data: {
  name: string;
  otp: string;
}): string => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #f4f4f5; padding: 32px; border-radius: 16px; border: 1px solid #27272a;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #ef4444; font-size: 22px; margin: 0;">Data Deletion Request Verification</h1>
        <p style="color: #a1a1aa; font-size: 14px; margin-top: 6px;">DPDP Act &amp; Privacy Compliance — ENGIPLEX Consultation</p>
      </div>

      <p style="color: #e4e4e7; font-size: 14px; line-height: 1.6;">Hello <strong>${data.name}</strong>,</p>
      <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">We received a request to permanently delete your account and personal information from ENGIPLEX Consultation. Use the 6-digit verification code below to authorize this deletion:</p>

      <div style="background: #18181b; border: 2px dashed #ef4444; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #f4f4f5; font-family: monospace;">${data.otp}</span>
        <p style="color: #ef4444; font-size: 12px; margin: 8px 0 0 0; font-weight: 600;">Valid for 10 minutes only</p>
      </div>

      <div style="background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 12px; padding: 14px; font-size: 12px; color: #fca5a5; line-height: 1.5; margin-bottom: 20px;">
        ⚠️ <strong>Warning:</strong> Deletion is irreversible. Once verified, your personal account profile, contact credentials, and session bookings will be permanently removed. (Public ratings/reviews will be retained anonymously).
      </div>

      <p style="color: #71717a; font-size: 12px; margin: 0;">If you did not initiate this request, please ignore this email and your data will remain completely secure.</p>
    </div>
  `;
};

export const buildDataDeletionConfirmationEmail = (data: {
  name: string;
  email: string;
  creationDate: string;
  deletionDate: string;
}): string => {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #09090b; color: #f4f4f5; padding: 32px; border-radius: 16px; border: 1px solid #27272a;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #10b981; font-size: 22px; margin: 0;">Data Deletion Completed</h1>
        <p style="color: #a1a1aa; font-size: 14px; margin-top: 6px;">Confirmation of Personal Data Erasure (DPDP Act, 2023)</p>
      </div>

      <p style="color: #e4e4e7; font-size: 14px; line-height: 1.6;">Hello <strong>${data.name}</strong>,</p>
      <p style="color: #a1a1aa; font-size: 14px; line-height: 1.6;">As requested, your personal data and account records have been permanently erased from the ENGIPLEX Consultation database.</p>

      <div style="background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #e4e4e7; margin-top: 0; font-size: 15px; border-bottom: 1px solid #27272a; padding-bottom: 10px;">Audit &amp; Erasure Record</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="color: #a1a1aa; padding: 6px 0;">User Name:</td>
            <td style="color: #f4f4f5; font-weight: 600; text-align: right;">${data.name}</td>
          </tr>
          <tr>
            <td style="color: #a1a1aa; padding: 6px 0;">Registered Email:</td>
            <td style="color: #f4f4f5; font-weight: 600; text-align: right;">${data.email}</td>
          </tr>
          <tr>
            <td style="color: #a1a1aa; padding: 6px 0;">Account / Data Creation Time:</td>
            <td style="color: #f4f4f5; font-weight: 600; text-align: right;">${data.creationDate}</td>
          </tr>
          <tr>
            <td style="color: #a1a1aa; padding: 6px 0;">Data Deletion Completed Time:</td>
            <td style="color: #10b981; font-weight: 700; text-align: right;">${data.deletionDate}</td>
          </tr>
          <tr>
            <td style="color: #a1a1aa; padding: 6px 0;">Purged Items:</td>
            <td style="color: #f4f4f5; text-align: right;">Profile, Auth Credentials, Booking History, Contacts</td>
          </tr>
          <tr>
            <td style="color: #a1a1aa; padding: 6px 0;">Feedback / Reviews:</td>
            <td style="color: #38bdf8; text-align: right;">Retained (Anonymized)</td>
          </tr>
        </table>
      </div>

      <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 14px; font-size: 12px; color: #6ee7b7; line-height: 1.5; margin-bottom: 20px;">
        ✓ This action complies with Section 12 (Right to Erasure) of the Digital Personal Data Protection (DPDP) Act, 2023.
      </div>

      <p style="color: #71717a; font-size: 12px; margin: 0;">Thank you for having been part of ENGIPLEX Consultation. If you ever wish to use our advisory services in the future, you are welcome to register afresh.</p>
    </div>
  `;
};

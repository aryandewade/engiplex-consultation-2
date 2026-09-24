import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/consultflow',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'consultflow_jwt_secret_dev_key',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  GOOGLE_MEET_LINK: process.env.GOOGLE_MEET_LINK || 'https://meet.google.com',
  EMAIL_FROM: process.env.EMAIL_FROM || 'engiplexservices@gmail.com',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'ENGIPLEX Consultation',
  EMAIL_API_KEY: process.env.EMAIL_API_KEY || process.env.BREVO_API_KEY || '',
  BREVO_API_KEY: process.env.BREVO_API_KEY || process.env.EMAIL_API_KEY || '',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
};

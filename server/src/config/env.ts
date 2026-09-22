export const ENV = {
  PORT: process.env.PORT || '5000',
  MONGODB_URI:
    process.env.MONGODB_URI ||
    'mongodb+srv://engiplexservices_db_user:HrTSNulelrkzztqY@cluster0.pxpeum4.mongodb.net/consultflow?retryWrites=true&w=majority&appName=Cluster0',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  JWT_SECRET: process.env.JWT_SECRET || 'consultflow_super_secret_jwt_key_2026',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_TZ6ZiC4bWbn52f',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'cBBwDFrtWlaEvDRv3zX3nsrG',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_consultflow_2026',
  GOOGLE_MEET_LINK: process.env.GOOGLE_MEET_LINK || 'https://meet.google.com/ioy-bouu-eih',
  EMAIL_FROM: process.env.EMAIL_FROM || 'engiplexservices@gmail.com',
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'ENGIPLEX Consultation',
  EMAIL_API_KEY:
    process.env.EMAIL_API_KEY ||
    process.env.BREVO_API_KEY ||
    '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',
  BREVO_API_KEY:
    process.env.BREVO_API_KEY ||
    process.env.EMAIL_API_KEY ||
    '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',
  SMTP_HOST: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  SMTP_PORT: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587,
  SMTP_USER: process.env.SMTP_USER || 'b9860c001@smtp-brevo.com',
  SMTP_PASS:
    process.env.SMTP_PASS ||
    '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',
};

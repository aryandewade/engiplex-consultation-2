import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
// Connected to new MongoDB Atlas cluster (cluster0.pxpeum4.mongodb.net)

// Route imports
import authRoutes from './routes/authRoutes';
import consultantRoutes from './routes/consultantRoutes';
import bookingRoutes from './routes/bookingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import adminRoutes from './routes/adminRoutes';
import reviewRoutes from './routes/reviewRoutes';
import consultantPortalRoutes from './routes/consultantPortalRoutes';
import privacyRoutes from './routes/privacyRoutes';

import { Consultant } from './models/Consultant';
import { User } from './models/User';
import { Review } from './models/Review';
import { Booking } from './models/Booking';
import { USER_REVIEWS_CATALOG } from './data/reviewsCatalog';

const app = express();

const ASHISH_LINKEDIN_PFP =
  'https://media.licdn.com/dms/image/v2/D5603AQHgvioDlx9_IQ/profile-displayphoto-crop_800_800/B56Z6Y4CHeKsAM-/0/1780681286875?e=1790812800&v=beta&t=cNJpjcdLhjrXD9yCIux7_f5gICB2sThInUDzYEbESkI';

// Database connection
connectDB().then(async () => {
  try {
    await Consultant.updateMany(
      { name: { $regex: /Ashish/i } },
      {
        $set: {
          avatar: ASHISH_LINKEDIN_PFP,
          domain: 'Engineering Consultant',
          expertise: ['Career Roadmap', 'Resume Strategy', 'System Architecture', 'Interview Prep', 'Talent Mapping', 'Project Management'],
          technicalSkills: ['Data Analysis', 'Data Engineering', 'AI/ML', 'Automotive', 'Semiconductor', 'Software Engineering'],
          skills: ['Career Roadmap', 'Resume Strategy', 'System Architecture', 'Interview Prep', 'Talent Mapping', 'Project Management', 'Data Analysis', 'Data Engineering', 'AI/ML', 'Automotive', 'Semiconductor', 'Software Engineering'],
          fee: 999,
          slotDuration: 60,
        },
      }
    );
    await User.updateMany(
      { name: { $regex: /Ashish/i } },
      { $set: { avatar: ASHISH_LINKEDIN_PFP } }
    );
    console.log('[Server] Ashish Lichode avatar and skills synced.');

    // Database reviews cleanup: purge only previous automated test runs so genuine user reviews persist
    const testReviews = await Review.find({ userName: { $in: ['Tanvi Deshmukh', 'Aditi Deshpande', 'Automated Test'] } });
    if (testReviews.length > 0) {
      console.log(`[Server] Purging ${testReviews.length} automated test reviews:`, testReviews.map((r) => r.userName));
      await Review.deleteMany({ _id: { $in: testReviews.map((r) => r._id) } });
    }

    // Ensure baseline reviews in DB have calibrated ratings (averaging exactly 4.9/5)
    for (const seedReview of USER_REVIEWS_CATALOG) {
      await Review.updateMany(
        { userName: seedReview.name },
        { $set: { rating: seedReview.rating, tag: seedReview.tag } }
      );
    }

    const currentCount = await Review.countDocuments();
    console.log(`[Server] Synced database review count: ${currentCount}`);

    await Consultant.updateMany(
      { name: { $regex: /Ashish/i } },
      {
        $set: {
          reviewCount: currentCount,
          rating: 4.9,
        },
      }
    );

    // Ensure client@example.com has a confirmed booking for demonstration / verified client testing
    const demoClient = await User.findOne({ email: 'client@example.com' });
    const targetAshish = await Consultant.findOne({ name: { $regex: /Ashish/i } });
    if (demoClient && targetAshish) {
      const existingDemoBooking = await Booking.findOne({ userId: demoClient._id });
      if (!existingDemoBooking) {
        await Booking.create({
          userId: demoClient._id,
          consultantId: targetAshish._id,
          date: '2026-09-15',
          startTime: '19:00',
          endTime: '19:20',
          status: 'CONFIRMED',
          paymentStatus: 'PAID',
          amount: 999,
          meetingLink: 'https://meet.google.com/xyz-demo-ashish',
          receiptId: 'REC-DEMO-001',
        });
        console.log('[Server] Verified booking configured for client@example.com');
      }

      // Clean up any previously seeded demonstration bookings on 2026-09-16 so slots remain open
      await Booking.deleteMany({ receiptId: { $regex: /^REC-FULL-/ } });
    }
  } catch (err) {
    console.error('[Server] Failed during startup sync:', err);
  }
});

import path from 'path';
import fs from 'fs';

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server) or any host in production
      if (!origin) return callback(null, true);
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'ConsultFlow API',
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/consultants', consultantRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/consultant-portal', consultantPortalRoutes);
app.use('/api/privacy', privacyRoutes);

// Serve static React client build in production
const candidateDistPaths = [
  path.resolve(__dirname, '../../client/dist'),
  path.resolve(__dirname, '../client/dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), '../client/dist'),
  path.resolve(process.cwd(), 'dist'),
];

const clientDistPath = candidateDistPaths.find((p) => fs.existsSync(p));
if (clientDistPath) {
  console.log(`[Production] Serving static client build from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));

  // SPA fallback for all non-API GET routes (e.g. /privacy, /terms, /book/:id, /consultants/:id)
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use(errorHandler);

const PORT = parseInt(ENV.PORT, 10) || 5000;

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 ConsultFlow Server running on http://127.0.0.1:${PORT}`);
  console.log(`📡 Health check: http://127.0.0.1:${PORT}/api/health`);
  console.log(`======================================================\n`);
});

export default app;

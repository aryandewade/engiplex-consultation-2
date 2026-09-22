import mongoose from 'mongoose';
import dns from 'dns';
import { ENV } from './env';

// Set public DNS resolvers to handle SRV record lookups reliably across all environments
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  // Ignore if custom DNS cannot be set
}

// Buffer commands during brief network reconnects instead of failing after 2.5s
mongoose.set('bufferTimeoutMS', 20000);

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) return;
  try {
    const conn = await mongoose.connect(ENV.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    // Keep retrying in background
    setTimeout(connectDB, 3000);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('[Database] MongoDB disconnected. Attempting reconnect...');
  connectDB();
});

mongoose.connection.on('error', (err) => {
  console.error('[Database] MongoDB error:', err);
});

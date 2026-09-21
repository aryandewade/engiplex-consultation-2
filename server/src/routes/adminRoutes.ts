import { Router } from 'express';
import {
  getDashboardStats,
  getTodaySchedule,
  blockSlot,
  unblockSlot,
  getAllBookings,
  adminReschedule,
  adminCancel,
  createConsultant,
  updateConsultant,
  getRecentEmails,
} from '../controllers/adminController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Protect all admin routes
router.use(authenticate);
router.use(requireRole('ADMIN'));

router.get('/stats', getDashboardStats);
router.get('/today', getTodaySchedule);
router.get('/bookings', getAllBookings);
router.post('/bookings/:id/reschedule', adminReschedule);
router.post('/bookings/:id/cancel', adminCancel);
router.post('/block-slot', blockSlot);
router.delete('/block-slot/:id', unblockSlot);
router.post('/consultants', createConsultant);
router.put('/consultants/:id', updateConsultant);
router.get('/emails', getRecentEmails);

export default router;

import { Router } from 'express';
import {
  reserve,
  confirm,
  getBookingById,
  getUserBookings,
  reschedule,
  cancel,
} from '../controllers/bookingController';
import { authenticate, optionalAuthenticate } from '../middleware/authMiddleware';

const router = Router();

// Guest-accessible booking flow with email confirmation
router.post('/reserve', optionalAuthenticate, reserve);
router.post('/confirm', optionalAuthenticate, confirm);
router.get('/:id', optionalAuthenticate, getBookingById);

// Operations requiring logged in session
router.get('/user/all', authenticate, getUserBookings);
router.post('/:id/reschedule', authenticate, reschedule);
router.post('/:id/cancel', authenticate, cancel);

export default router;


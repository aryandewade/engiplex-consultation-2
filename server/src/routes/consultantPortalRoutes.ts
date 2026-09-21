import { Router } from 'express';
import { getMyBookings, completeBooking } from '../controllers/consultantPortalController';
import { authenticate, requireRole } from '../middleware/authMiddleware';

const router = Router();

// Require authenticated consultant or admin
router.use(authenticate);
router.use(requireRole('CONSULTANT'));

router.get('/bookings', getMyBookings);
router.put('/bookings/:id/complete', completeBooking);

export default router;

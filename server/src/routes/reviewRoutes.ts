import { Router } from 'express';
import { addReview, getAllReviews } from '../controllers/reviewController';
import { optionalAuthenticate } from '../middleware/authMiddleware';

const router = Router();

router.get('/', getAllReviews);
router.post('/', optionalAuthenticate, addReview);

export default router;

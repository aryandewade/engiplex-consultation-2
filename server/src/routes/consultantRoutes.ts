import { Router } from 'express';
import {
  getAllConsultants,
  getConsultantById,
  getConsultantMonth,
  getConsultantDailySlots,
} from '../controllers/consultantController';

const router = Router();

router.get('/', getAllConsultants);
router.get('/:id', getConsultantById);
router.get('/:id/availability', getConsultantMonth);
router.get('/:id/slots', getConsultantDailySlots);

export default router;

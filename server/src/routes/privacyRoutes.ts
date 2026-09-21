import { Router } from 'express';
import {
  requestDataDeletion,
  verifyAndExecuteDataDeletion,
} from '../controllers/privacyController';

const router = Router();

router.post('/request-deletion-otp', requestDataDeletion);
router.post('/verify-and-delete', verifyAndExecuteDataDeletion);

export default router;

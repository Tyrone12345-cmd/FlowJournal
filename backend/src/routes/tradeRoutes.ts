import { Router } from 'express';
import {
  createTrade,
  getTrades,
  getTrade,
  updateTrade,
  deleteTrade,
  getTradeStats,
} from '../controllers/tradeController';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/stats', getTradeStats);
router.post('/', createTrade);
router.get('/', getTrades);
router.get('/:id', getTrade);
router.put('/:id', updateTrade);
router.delete('/:id', deleteTrade);

export default router;

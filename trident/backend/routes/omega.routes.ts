import { Router } from '../router/router';
import { payoutHandler } from '../../engines/omega/handlers';

const router = new Router();
router.post('/payout', payoutHandler);
export default router;

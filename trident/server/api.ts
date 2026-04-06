import { Router } from './lib/router';
import * as ascend from './engine/ascendant';
import * as apex from './engine/apex';
import * as omega from './engine/omega';
import * as pantheon from './engine/pantheon';
import * as hyperion from './engine/hyperion';
import * as sovereign from './engine/sovereign';

import { solanaAuthWithNonce } from './middleware/solanaAuthWithNonce';
import { rateLimiter } from './src/middleware/rateLimit';


export const api = new Router();

// Apply rate limiting and Solana signature verification to all endpoints
api.use(rateLimiter);
api.use(solanaAuthWithNonce);

// ASCENDANT (Identity)
api.post('/ascend/register', ascend.register);
api.post('/ascend/verify', ascend.verify);
api.get('/ascend/profile/:id', ascend.profile);

// APEX (Split logic)
api.post('/apex/split', apex.split);
api.post('/apex/preview', apex.preview);
api.get('/apex/rules', apex.rules);
api.post('/apex/rules/update', apex.updateRules);

// OMEGA (Payouts)
api.post('/omega/payout', omega.payout);
api.post('/omega/payout/batch', omega.batch);
api.get('/omega/payout/:id', omega.status);
api.get('/omega/balance', omega.balance);

// PANTHEON (System control)
api.get('/pantheon/engines', pantheon.list);
api.post('/pantheon/engine/:name/enable', pantheon.enable);
api.post('/pantheon/engine/:name/disable', pantheon.disable);
api.get('/pantheon/audit', pantheon.audit);

// HYPERION (Analytics)
api.get('/hyperion/metrics', hyperion.metrics);
api.get('/hyperion/creator/:id', hyperion.creator);
api.get('/hyperion/transactions', hyperion.transactions);

// SOVEREIGN (Platform identity)
api.get('/sovereign/version', sovereign.version);
api.get('/sovereign/capabilities', sovereign.capabilities);
api.get('/sovereign/health', sovereign.health);

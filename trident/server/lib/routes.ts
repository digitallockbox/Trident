// routes.ts
import { Router } from './router';
import * as ascendHandlers from './handlers/ascend';
import * as apexHandlers from './handlers/apex';
import * as omegaHandlers from './handlers/omega';
import { createHybridSovereignAuth } from '../middleware/hybridSovereignAuth';
import * as pantheonHandlers from './handlers/pantheon';
import * as hyperionHandlers from './handlers/hyperion';
import * as sovereignHandlers from './handlers/sovereign';


// Example tenants config (replace with real config in production)
const tenants = [
    { key: 'demo-api-key', tenant: 'demo', active: true },
];
const hybridAuth = createHybridSovereignAuth({ tenants });

// ASCEND
router.get('/ascend/status', ascendHandlers.status);
router.post('/ascend/register', ascendHandlers.register);
router.post('/ascend/verify', ascendHandlers.verify);
router.get('/ascend/profile/:id', ascendHandlers.profile);

// APEX
router.post('/apex/split', apexHandlers.split);
router.post('/apex/preview', apexHandlers.preview);
router.get('/apex/rules', apexHandlers.rules);
router.post('/apex/rules/update', apexHandlers.updateRules);

// OMEGA
router.post('/omega/payout', hybridAuth, omegaHandlers.payout);
router.post('/omega/payout/batch', omegaHandlers.batch);
router.get('/omega/payout/:id', omegaHandlers.status);
router.get('/omega/balance', omegaHandlers.balance);

// PANTHEON
router.get('/pantheon/engines', pantheonHandlers.list);
router.post('/pantheon/engine/:name/enable', pantheonHandlers.enable);
router.post('/pantheon/engine/:name/disable', pantheonHandlers.disable);
router.get('/pantheon/audit', pantheonHandlers.audit);

// HYPERION
router.get('/hyperion/metrics', hyperionHandlers.metrics);
router.get('/hyperion/creator/:id', hyperionHandlers.creator);
router.get('/hyperion/transactions', hyperionHandlers.transactions);

// SOVEREIGN
router.get('/sovereign/version', sovereignHandlers.version);
router.get('/sovereign/capabilities', sovereignHandlers.capabilities);
router.get('/sovereign/health', sovereignHandlers.health);

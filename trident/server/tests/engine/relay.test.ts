import { describe, it, expect, beforeEach } from 'vitest';
import { Relay } from '../../engine/relay';

describe('Relay — Gasless Solana Transaction Engine', () => {
    let relay: Relay;

    beforeEach(() => {
        relay = new Relay();
    });

    // ── Helpers ──────────────────────────────────────────────

    async function fundAndRegister(name = 'Acme Retail', wallet = 'SOL:AcmeWallet', dailyLimit = 100) {
        await relay.execute({ action: 'fund', amount: 10 }); // 10 SOL
        const biz = await relay.execute({ action: 'registerBusiness', name, wallet, dailyLimit });
        return biz.business.id as string;
    }

    // ═══════════════════════════════════════════════════════════
    // 1. BUSINESS REGISTRATION
    // ═══════════════════════════════════════════════════════════

    describe('registerBusiness', () => {
        it('registers a retail business', async () => {
            const result = await relay.execute({
                action: 'registerBusiness',
                name: 'Downtown Pharmacy',
                wallet: 'SOL:PharmWallet',
                dailyLimit: 500,
            });

            expect(result.status).toBe('success');
            expect(result.business.name).toBe('Downtown Pharmacy');
            expect(result.business.dailyLimit).toBe(500);
        });

        it('rejects missing name', async () => {
            const result = await relay.execute({ action: 'registerBusiness', wallet: 'SOL:w' });
            expect(result.status).toBe('error');
        });

        it('rejects missing wallet', async () => {
            const result = await relay.execute({ action: 'registerBusiness', name: 'X' });
            expect(result.status).toBe('error');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 2. FEE POOL
    // ═══════════════════════════════════════════════════════════

    describe('fee pool', () => {
        it('funds the relay fee pool', async () => {
            const result = await relay.execute({ action: 'fund', amount: 5 });
            expect(result.status).toBe('success');
            expect(result.funded).toBe(5);
            expect(result.feePool.balance).toBe(5);
            expect(result.feePool.totalFunded).toBe(5);
        });

        it('accumulates multiple fundings', async () => {
            await relay.execute({ action: 'fund', amount: 3 });
            await relay.execute({ action: 'fund', amount: 7 });
            const bal = await relay.execute({ action: 'balance' });
            expect(bal.feePool.balance).toBe(10);
            expect(bal.feePool.totalFunded).toBe(10);
        });

        it('rejects zero funding', async () => {
            const result = await relay.execute({ action: 'fund', amount: 0 });
            expect(result.status).toBe('error');
        });

        it('rejects negative funding', async () => {
            const result = await relay.execute({ action: 'fund', amount: -5 });
            expect(result.status).toBe('error');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 3. TRANSACTION SUBMISSION
    // ═══════════════════════════════════════════════════════════

    describe('submit — gasless transactions', () => {
        it('submits a gasless payment transaction', async () => {
            const bizId = await fundAndRegister();

            const result = await relay.execute({
                action: 'submit',
                businessId: bizId,
                wallet: 'SOL:CustomerWallet',
                type: 'payment',
                payload: { amount: 25.99, currency: 'USDC', recipient: 'SOL:StoreWallet' },
                computeUnits: 200_000,
            });

            expect(result.status).toBe('success');
            expect(result.transaction.status).toBe('confirmed');
            expect(result.transaction.gasless).toBe(true);
            expect(result.transaction.sponsoredBy).toBe('platform-relayer');
            expect(result.transaction.signature).toBeTruthy();
            expect(result.transaction.fee).toBeGreaterThan(0);
        });

        it('deducts fee from pool on submit', async () => {
            const bizId = await fundAndRegister();

            const beforeBal = await relay.execute({ action: 'balance' });
            await relay.execute({
                action: 'submit',
                businessId: bizId,
                wallet: 'SOL:W1',
                type: 'transfer',
            });
            const afterBal = await relay.execute({ action: 'balance' });

            expect(afterBal.feePool.balance).toBeLessThan(beforeBal.feePool.balance);
            expect(afterBal.feePool.totalSpent).toBeGreaterThan(0);
        });

        it('tracks daily usage per business', async () => {
            const bizId = await fundAndRegister('Store', 'SOL:s', 3);

            await relay.execute({ action: 'submit', businessId: bizId, wallet: 'SOL:c1' });
            await relay.execute({ action: 'submit', businessId: bizId, wallet: 'SOL:c2' });
            const result = await relay.execute({ action: 'submit', businessId: bizId, wallet: 'SOL:c3' });
            expect(result.status).toBe('success');
            expect(result.businessDailyRemaining).toBe(0);

            // 4th should fail
            const result4 = await relay.execute({ action: 'submit', businessId: bizId, wallet: 'SOL:c4' });
            expect(result4.status).toBe('error');
            expect(result4.error).toContain('Daily transaction limit');
        });

        it('rejects unknown business', async () => {
            await relay.execute({ action: 'fund', amount: 1 });
            const result = await relay.execute({ action: 'submit', businessId: 'BIZ-fake', wallet: 'SOL:w' });
            expect(result.status).toBe('error');
            expect(result.error).toContain('Business not found');
        });

        it('rejects when fee pool is empty', async () => {
            // Register without funding
            const biz = await relay.execute({ action: 'registerBusiness', name: 'Broke', wallet: 'SOL:b' });
            const result = await relay.execute({ action: 'submit', businessId: biz.business.id, wallet: 'SOL:c' });
            expect(result.status).toBe('error');
            expect(result.error).toContain('Insufficient fee pool');
        });

        it('rejects missing businessId', async () => {
            const result = await relay.execute({ action: 'submit', wallet: 'SOL:w' });
            expect(result.status).toBe('error');
        });

        it('rejects missing wallet', async () => {
            const result = await relay.execute({ action: 'submit', businessId: 'BIZ-x' });
            expect(result.status).toBe('error');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 4. FEE ESTIMATION
    // ═══════════════════════════════════════════════════════════

    describe('estimate', () => {
        it('estimates fee for a transaction', async () => {
            const result = await relay.execute({ action: 'estimate', computeUnits: 200_000, type: 'payment' });
            expect(result.status).toBe('success');
            expect(result.estimate.totalFee).toBeGreaterThan(0);
            expect(result.estimate.gasless).toBe(true);
            expect(result.estimate.paidBy).toBe('platform');
            expect(result.estimate.currency).toBe('SOL');
        });

        it('fee scales with compute units', async () => {
            const small = await relay.execute({ action: 'estimate', computeUnits: 50_000 });
            const large = await relay.execute({ action: 'estimate', computeUnits: 400_000 });
            expect(large.estimate.totalFee).toBeGreaterThan(small.estimate.totalFee);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 5. TRANSACTION STATUS & HISTORY
    // ═══════════════════════════════════════════════════════════

    describe('status', () => {
        it('retrieves transaction status by ID', async () => {
            const bizId = await fundAndRegister();
            const submit = await relay.execute({ action: 'submit', businessId: bizId, wallet: 'SOL:w' });

            const result = await relay.execute({ action: 'status', txId: submit.transaction.id });
            expect(result.status).toBe('success');
            expect(result.transaction.status).toBe('confirmed');
            expect(result.transaction.signature).toBeTruthy();
        });

        it('rejects unknown txId', async () => {
            const result = await relay.execute({ action: 'status', txId: 'TX-fake' });
            expect(result.status).toBe('error');
        });

        it('rejects missing txId', async () => {
            const result = await relay.execute({ action: 'status' });
            expect(result.status).toBe('error');
        });
    });

    describe('history', () => {
        it('returns transaction history for a business', async () => {
            const bizId = await fundAndRegister();
            await relay.execute({ action: 'submit', businessId: bizId, wallet: 'SOL:c1' });
            await relay.execute({ action: 'submit', businessId: bizId, wallet: 'SOL:c2' });

            const result = await relay.execute({ action: 'history', businessId: bizId });
            expect(result.totalTransactions).toBe(2);
            expect(result.totalFeesSponsored).toBeGreaterThan(0);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 6. CONFIGURATION
    // ═══════════════════════════════════════════════════════════

    describe('configure', () => {
        it('updates relay config', async () => {
            const result = await relay.execute({
                action: 'configure',
                maxComputeUnits: 500_000,
                baseFee: 0.00001,
            });
            expect(result.config.maxComputeUnits).toBe(500_000);
            expect(result.config.baseFee).toBe(0.00001);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 7. PLATFORM STATS
    // ═══════════════════════════════════════════════════════════

    describe('stats', () => {
        it('returns full relay statistics', async () => {
            const bizId = await fundAndRegister();
            await relay.execute({ action: 'submit', businessId: bizId, wallet: 'SOL:c1' });

            const result = await relay.execute({ action: 'stats' });
            expect(result.totalTransactions).toBe(1);
            expect(result.confirmed).toBe(1);
            expect(result.registeredBusinesses).toBe(1);
            expect(result.totalFeesSponsored).toBeGreaterThan(0);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 8. FULL LIFECYCLE — RETAIL STORE SCENARIO
    // ═══════════════════════════════════════════════════════════

    describe('full lifecycle — retail store gasless payments', () => {
        it('end-to-end: register store, fund pool, process 3 gasless payments, verify stats', async () => {
            // 1. Fund the relay pool with 5 SOL
            const fund = await relay.execute({ action: 'fund', amount: 5, source: 'platform-treasury' });
            expect(fund.feePool.balance).toBe(5);

            // 2. Register a retail store
            const biz = await relay.execute({
                action: 'registerBusiness',
                name: 'SoHo Coffee House',
                wallet: 'SOL:SoHoCoffee42',
                dailyLimit: 1000,
            });
            const bizId = biz.business.id;

            // 3. Customer pays $4.50 for a latte — gasless
            const tx1 = await relay.execute({
                action: 'submit',
                businessId: bizId,
                wallet: 'SOL:Customer1',
                type: 'payment',
                payload: { amount: 4.50, item: 'Latte', currency: 'USDC' },
                computeUnits: 150_000,
            });
            expect(tx1.status).toBe('success');
            expect(tx1.transaction.gasless).toBe(true);

            // 4. Customer pays $12.00 for lunch — gasless
            const tx2 = await relay.execute({
                action: 'submit',
                businessId: bizId,
                wallet: 'SOL:Customer2',
                type: 'payment',
                payload: { amount: 12.00, item: 'Lunch Set', currency: 'USDC' },
            });
            expect(tx2.status).toBe('success');

            // 5. Customer pays $3.75 for pastry — gasless
            const tx3 = await relay.execute({
                action: 'submit',
                businessId: bizId,
                wallet: 'SOL:Customer3',
                type: 'payment',
                payload: { amount: 3.75, item: 'Croissant', currency: 'USDC' },
            });
            expect(tx3.status).toBe('success');

            // 6. Verify all transactions are confirmed
            const s1 = await relay.execute({ action: 'status', txId: tx1.transaction.id });
            const s2 = await relay.execute({ action: 'status', txId: tx2.transaction.id });
            const s3 = await relay.execute({ action: 'status', txId: tx3.transaction.id });
            expect(s1.transaction.status).toBe('confirmed');
            expect(s2.transaction.status).toBe('confirmed');
            expect(s3.transaction.status).toBe('confirmed');

            // 7. Check transaction history
            const history = await relay.execute({ action: 'history', businessId: bizId });
            expect(history.totalTransactions).toBe(3);
            expect(history.totalFeesSponsored).toBeGreaterThan(0);

            // 8. Verify fee pool was spent but not drained
            const pool = await relay.execute({ action: 'balance' });
            expect(pool.feePool.balance).toBeLessThan(5);
            expect(pool.feePool.totalSpent).toBeGreaterThan(0);

            // 9. Platform stats
            const stats = await relay.execute({ action: 'stats' });
            expect(stats.totalTransactions).toBe(3);
            expect(stats.confirmed).toBe(3);
            expect(stats.failed).toBe(0);
            expect(stats.registeredBusinesses).toBe(1);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 9. EDGE CASES
    // ═══════════════════════════════════════════════════════════

    describe('edge cases', () => {
        it('returns error for unknown action', async () => {
            const result = await relay.execute({ action: 'explode' });
            expect(result.status).toBe('error');
            expect(result.error).toContain('Unknown action');
        });

        it('caps compute units to maxComputeUnits', async () => {
            const est = await relay.execute({ action: 'estimate', computeUnits: 999_999_999 });
            expect(est.estimate.computeUnits).toBeLessThanOrEqual(400_000);
        });
    });
});

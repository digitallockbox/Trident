import { describe, it, expect, beforeEach } from 'vitest';
import { Conduit } from '../../engine/conduit';

/**
 * Conduit — Split-Payment & Payout Engine Tests
 *
 * Full lifecycle coverage:
 *   Rule registry → Revenue capture → Balance accumulation → Payout disbursement
 *
 * Scenario: A streaming / creator-economy platform where purchases
 * are split between creator (85%), platform (10%), affiliate (5%).
 */
describe('Conduit — Split-Payment & Payout Engine', () => {
    let conduit: Conduit;

    beforeEach(() => {
        conduit = new Conduit();
    });

    // ═══════════════════════════════════════════════════════════
    // 1. SPLIT-RULE REGISTRY
    // ═══════════════════════════════════════════════════════════

    describe('registerRule', () => {
        it('registers a standard 85/10/5 split rule', async () => {
            const result = await conduit.execute({
                action: 'registerRule',
                name: 'creator-standard',
                shares: [
                    { party: 'creator-alice', role: 'creator', percent: 85 },
                    { party: 'platform-treasury', role: 'platform', percent: 10 },
                    { party: 'affiliate-bob', role: 'affiliate', percent: 5 },
                ],
            });

            expect(result.status).toBe('success');
            expect(result.rule.name).toBe('creator-standard');
            expect(result.rule.shares).toHaveLength(3);
            expect(result.rule.shares[0].percent).toBe(85);
        });

        it('rejects shares that do not total 100%', async () => {
            const result = await conduit.execute({
                action: 'registerRule',
                name: 'bad-split',
                shares: [
                    { party: 'a', role: 'creator', percent: 50 },
                    { party: 'b', role: 'platform', percent: 30 },
                ],
            });

            expect(result.status).toBe('error');
            expect(result.error).toContain('100%');
        });

        it('rejects empty shares', async () => {
            const result = await conduit.execute({
                action: 'registerRule',
                name: 'empty',
                shares: [],
            });

            expect(result.status).toBe('error');
        });

        it('rejects missing rule name', async () => {
            const result = await conduit.execute({
                action: 'registerRule',
                shares: [{ party: 'x', role: 'creator', percent: 100 }],
            });

            expect(result.status).toBe('error');
        });

        it('rejects zero-percent share', async () => {
            const result = await conduit.execute({
                action: 'registerRule',
                name: 'bad',
                shares: [
                    { party: 'a', role: 'creator', percent: 0 },
                    { party: 'b', role: 'platform', percent: 100 },
                ],
            });

            expect(result.status).toBe('error');
        });

        it('rejects share with missing party', async () => {
            const result = await conduit.execute({
                action: 'registerRule',
                name: 'missing-party',
                shares: [{ party: '', role: 'creator', percent: 100 }],
            });

            expect(result.status).toBe('error');
        });
    });

    describe('removeRule', () => {
        it('removes an existing rule', async () => {
            const reg = await conduit.execute({
                action: 'registerRule',
                name: 'temp',
                shares: [{ party: 'x', role: 'creator', percent: 100 }],
            });

            const result = await conduit.execute({ action: 'removeRule', ruleId: reg.rule.id });
            expect(result.status).toBe('success');
            expect(result.removed).toBe(reg.rule.id);

            const list = await conduit.execute({ action: 'listRules' });
            expect(list.totalRules).toBe(0);
        });

        it('rejects removal of unknown rule', async () => {
            const result = await conduit.execute({ action: 'removeRule', ruleId: 'RULE-fake' });
            expect(result.status).toBe('error');
        });
    });

    describe('listRules', () => {
        it('lists all registered rules', async () => {
            await conduit.execute({
                action: 'registerRule',
                name: 'rule-a',
                shares: [{ party: 'x', role: 'creator', percent: 100 }],
            });
            await conduit.execute({
                action: 'registerRule',
                name: 'rule-b',
                shares: [
                    { party: 'y', role: 'creator', percent: 70 },
                    { party: 'z', role: 'platform', percent: 30 },
                ],
            });

            const result = await conduit.execute({ action: 'listRules' });
            expect(result.totalRules).toBe(2);
            expect(result.rules).toHaveLength(2);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 2. REVENUE CAPTURE & SPLITTING
    // ═══════════════════════════════════════════════════════════

    describe('capture — revenue splitting', () => {
        async function setupStandardRule() {
            const reg = await conduit.execute({
                action: 'registerRule',
                name: 'standard',
                shares: [
                    { party: 'creator-alice', role: 'creator', percent: 85 },
                    { party: 'platform-treasury', role: 'platform', percent: 10 },
                    { party: 'affiliate-bob', role: 'affiliate', percent: 5 },
                ],
            });
            return reg.rule.id as string;
        }

        it('splits $100 purchase: $85 creator, $10 platform, $5 affiliate', async () => {
            const ruleId = await setupStandardRule();

            const result = await conduit.execute({
                action: 'capture',
                ruleId,
                amount: 100,
                source: 'painting-purchase',
                creator: 'alice',
            });

            expect(result.status).toBe('success');
            expect(result.grossAmount).toBe(100);
            expect(result.splits).toHaveLength(3);
            expect(result.splits[0]).toEqual({ party: 'creator-alice', role: 'creator', amount: 85 });
            expect(result.splits[1]).toEqual({ party: 'platform-treasury', role: 'platform', amount: 10 });
            expect(result.splits[2]).toEqual({ party: 'affiliate-bob', role: 'affiliate', amount: 5 });
        });

        it('handles uneven amounts with correct rounding ($33.33)', async () => {
            const ruleId = await setupStandardRule();

            const result = await conduit.execute({ action: 'capture', ruleId, amount: 33.33 });

            const totalSplit = result.splits.reduce((s: number, sp: any) => s + sp.amount, 0);
            // All splits must sum to the gross amount (no money lost/gained)
            expect(Math.abs(totalSplit - 33.33)).toBeLessThan(0.02);
        });

        it('applies multiplier boost (2x)', async () => {
            const ruleId = await setupStandardRule();

            const result = await conduit.execute({
                action: 'capture',
                ruleId,
                amount: 50,
                multiplier: 2,
            });

            expect(result.grossAmount).toBe(100);
            expect(result.splits[0].amount).toBe(85); // 85% of 100
        });

        it('credits balances correctly after capture', async () => {
            const ruleId = await setupStandardRule();

            await conduit.execute({ action: 'capture', ruleId, amount: 200 });

            const creator = await conduit.execute({ action: 'balance', party: 'creator-alice' });
            const platform = await conduit.execute({ action: 'balance', party: 'platform-treasury' });
            const affiliate = await conduit.execute({ action: 'balance', party: 'affiliate-bob' });

            expect(creator.balance.available).toBe(170);     // 85% of 200
            expect(platform.balance.available).toBe(20);     // 10% of 200
            expect(affiliate.balance.available).toBe(10);     // 5% of 200
        });

        it('accumulates balances over multiple events', async () => {
            const ruleId = await setupStandardRule();

            await conduit.execute({ action: 'capture', ruleId, amount: 100 });
            await conduit.execute({ action: 'capture', ruleId, amount: 100 });
            await conduit.execute({ action: 'capture', ruleId, amount: 100 });

            const creator = await conduit.execute({ action: 'balance', party: 'creator-alice' });
            expect(creator.balance.available).toBe(255);      // 85 * 3
            expect(creator.balance.totalEarned).toBe(255);
        });

        it('rejects capture with invalid rule ID', async () => {
            const result = await conduit.execute({ action: 'capture', ruleId: 'RULE-fake', amount: 100 });
            expect(result.status).toBe('error');
        });

        it('rejects capture with zero amount', async () => {
            const ruleId = await setupStandardRule();
            const result = await conduit.execute({ action: 'capture', ruleId, amount: 0 });
            expect(result.status).toBe('error');
        });

        it('rejects capture with negative amount', async () => {
            const ruleId = await setupStandardRule();
            const result = await conduit.execute({ action: 'capture', ruleId, amount: -50 });
            expect(result.status).toBe('error');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 3. BALANCE QUERIES
    // ═══════════════════════════════════════════════════════════

    describe('balance', () => {
        it('returns zero balance for unknown party', async () => {
            const result = await conduit.execute({ action: 'balance', party: 'nobody' });
            expect(result.balance.available).toBe(0);
            expect(result.balance.totalEarned).toBe(0);
        });

        it('rejects balance query without party', async () => {
            const result = await conduit.execute({ action: 'balance' });
            expect(result.status).toBe('error');
        });
    });

    describe('ledger', () => {
        it('returns all revenue events', async () => {
            const reg = await conduit.execute({
                action: 'registerRule',
                name: 'solo',
                shares: [{ party: 'alice', role: 'creator', percent: 100 }],
            });
            await conduit.execute({ action: 'capture', ruleId: reg.rule.id, amount: 10 });
            await conduit.execute({ action: 'capture', ruleId: reg.rule.id, amount: 20 });

            const result = await conduit.execute({ action: 'ledger' });
            expect(result.totalEvents).toBe(2);
        });

        it('filters ledger by party', async () => {
            const reg = await conduit.execute({
                action: 'registerRule',
                name: 'two-way',
                shares: [
                    { party: 'alice', role: 'creator', percent: 70 },
                    { party: 'bob', role: 'platform', percent: 30 },
                ],
            });
            await conduit.execute({ action: 'capture', ruleId: reg.rule.id, amount: 100 });

            const result = await conduit.execute({ action: 'ledger', party: 'alice' });
            expect(result.totalEvents).toBe(1);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 4. PAYOUT PROCESSING
    // ═══════════════════════════════════════════════════════════

    describe('payout — disbursement', () => {
        async function fundCreator(amount: number) {
            const reg = await conduit.execute({
                action: 'registerRule',
                name: 'solo',
                shares: [{ party: 'creator-alice', role: 'creator', percent: 100 }],
            });
            await conduit.execute({
                action: 'capture',
                ruleId: reg.rule.id,
                amount,
                source: 'painting-sale',
                creator: 'alice',
            });
        }

        it('pays out full available balance', async () => {
            await fundCreator(500);

            const result = await conduit.execute({
                action: 'payout',
                party: 'creator-alice',
                destination: 'SOL:AliceWallet123',
                method: 'solana-spl',
            });

            expect(result.status).toBe('success');
            expect(result.payout.amount).toBe(500);
            expect(result.payout.destination).toBe('SOL:AliceWallet123');
            expect(result.payout.method).toBe('solana-spl');
            expect(result.remainingBalance).toBe(0);
        });

        it('pays out partial amount', async () => {
            await fundCreator(1000);

            const result = await conduit.execute({
                action: 'payout',
                party: 'creator-alice',
                amount: 300,
                destination: 'SOL:Wallet',
            });

            expect(result.payout.amount).toBe(300);
            expect(result.remainingBalance).toBe(700);
        });

        it('tracks totalPaid after payout', async () => {
            await fundCreator(200);

            await conduit.execute({
                action: 'payout',
                party: 'creator-alice',
                amount: 50,
                destination: 'dest',
            });

            const bal = await conduit.execute({ action: 'balance', party: 'creator-alice' });
            expect(bal.balance.totalEarned).toBe(200);
            expect(bal.balance.totalPaid).toBe(50);
            expect(bal.balance.available).toBe(150);
        });

        it('allows multiple payouts until balance is drained', async () => {
            await fundCreator(100);

            await conduit.execute({ action: 'payout', party: 'creator-alice', amount: 30, destination: 'd' });
            await conduit.execute({ action: 'payout', party: 'creator-alice', amount: 30, destination: 'd' });
            await conduit.execute({ action: 'payout', party: 'creator-alice', amount: 30, destination: 'd' });

            const bal = await conduit.execute({ action: 'balance', party: 'creator-alice' });
            expect(bal.balance.available).toBe(10);
            expect(bal.balance.totalPaid).toBe(90);
        });

        it('rejects payout below minimum threshold', async () => {
            await fundCreator(5);

            const result = await conduit.execute({
                action: 'payout',
                party: 'creator-alice',
                destination: 'dest',
            });

            expect(result.status).toBe('error');
            expect(result.error).toContain('minimum payout');
        });

        it('rejects payout exceeding available balance', async () => {
            await fundCreator(100);

            const result = await conduit.execute({
                action: 'payout',
                party: 'creator-alice',
                amount: 500,
                destination: 'dest',
            });

            expect(result.status).toBe('error');
            expect(result.error).toContain('Insufficient balance');
        });

        it('rejects payout with no balance', async () => {
            const result = await conduit.execute({
                action: 'payout',
                party: 'creator-alice',
                destination: 'dest',
            });

            expect(result.status).toBe('error');
            expect(result.error).toContain('No available balance');
        });

        it('rejects payout without destination', async () => {
            await fundCreator(100);
            const result = await conduit.execute({ action: 'payout', party: 'creator-alice' });
            expect(result.status).toBe('error');
            expect(result.error).toContain('destination');
        });

        it('rejects payout without party', async () => {
            const result = await conduit.execute({ action: 'payout', destination: 'dest' });
            expect(result.status).toBe('error');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 5. PAYOUT HISTORY
    // ═══════════════════════════════════════════════════════════

    describe('payout history', () => {
        it('records every payout', async () => {
            const reg = await conduit.execute({
                action: 'registerRule',
                name: 'solo',
                shares: [{ party: 'alice', role: 'creator', percent: 100 }],
            });
            await conduit.execute({ action: 'capture', ruleId: reg.rule.id, amount: 200 });
            await conduit.execute({ action: 'payout', party: 'alice', amount: 50, destination: 'd1' });
            await conduit.execute({ action: 'payout', party: 'alice', amount: 75, destination: 'd2' });

            const history = await conduit.execute({ action: 'history', party: 'alice' });
            expect(history.totalPayouts).toBe(2);
            expect(history.totalDisbursed).toBe(125);
            expect(history.payouts[0].amount).toBe(50);
            expect(history.payouts[1].amount).toBe(75);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 6. CONFIGURATION
    // ═══════════════════════════════════════════════════════════

    describe('configure', () => {
        it('updates minimum payout threshold', async () => {
            const result = await conduit.execute({ action: 'configure', minPayout: 50 });
            expect(result.config.minPayout).toBe(50);
        });

        it('enforces updated min payout', async () => {
            const reg = await conduit.execute({
                action: 'registerRule',
                name: 'solo',
                shares: [{ party: 'alice', role: 'creator', percent: 100 }],
            });
            await conduit.execute({ action: 'capture', ruleId: reg.rule.id, amount: 40 });
            await conduit.execute({ action: 'configure', minPayout: 50 });

            const result = await conduit.execute({ action: 'payout', party: 'alice', destination: 'd' });
            expect(result.status).toBe('error');
            expect(result.error).toContain('minimum payout');
        });

        it('sets cycle payout limit', async () => {
            await conduit.execute({ action: 'configure', maxPayoutPerCycle: 100 });

            const reg = await conduit.execute({
                action: 'registerRule',
                name: 'solo',
                shares: [{ party: 'alice', role: 'creator', percent: 100 }],
            });
            await conduit.execute({ action: 'capture', ruleId: reg.rule.id, amount: 500 });

            const cycleId = 'CYCLE-test-001';
            await conduit.execute({ action: 'payout', party: 'alice', amount: 80, destination: 'd', cycleId });

            const result = await conduit.execute({
                action: 'payout',
                party: 'alice',
                amount: 80,
                destination: 'd',
                cycleId,
            });
            expect(result.status).toBe('error');
            expect(result.error).toContain('Cycle payout limit');
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 7. PLATFORM STATUS
    // ═══════════════════════════════════════════════════════════

    describe('status', () => {
        it('returns full platform snapshot', async () => {
            const reg = await conduit.execute({
                action: 'registerRule',
                name: 'standard',
                shares: [
                    { party: 'creator', role: 'creator', percent: 85 },
                    { party: 'platform', role: 'platform', percent: 10 },
                    { party: 'affiliate', role: 'affiliate', percent: 5 },
                ],
            });
            await conduit.execute({ action: 'capture', ruleId: reg.rule.id, amount: 1000 });
            await conduit.execute({ action: 'payout', party: 'creator', amount: 200, destination: 'd' });

            const status = await conduit.execute({ action: 'status' });

            expect(status.totalRevenue).toBe(1000);
            expect(status.totalDisbursed).toBe(200);
            expect(status.totalRetained).toBe(800);
            expect(status.activeRules).toBe(1);
            expect(status.totalEvents).toBe(1);
            expect(status.totalPayouts).toBe(1);
            expect(status.parties.creator.available).toBe(650);   // 850 earned - 200 paid
            expect(status.parties.platform.available).toBe(100);
            expect(status.parties.affiliate.available).toBe(50);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 8. FULL LIFECYCLE — PAINTING SALE SCENARIO
    // ═══════════════════════════════════════════════════════════

    describe('full lifecycle — 3-person painting split', () => {
        it('end-to-end: painting sold, revenue split, balances grow, payouts execute', async () => {
            // 1. Register split rule: artist 75%, gallery 15%, agent 10%
            const rule = await conduit.execute({
                action: 'registerRule',
                name: 'painting-sale',
                shares: [
                    { party: 'artist-maya', role: 'creator', percent: 75 },
                    { party: 'gallery-soho', role: 'platform', percent: 15 },
                    { party: 'agent-james', role: 'affiliate', percent: 10 },
                ],
            });
            expect(rule.status).toBe('success');
            const ruleId = rule.rule.id;

            // 2. Capture sale of painting #1: $2,400
            const sale1 = await conduit.execute({
                action: 'capture',
                ruleId,
                amount: 2400,
                source: 'painting-ocean-sunset',
                creator: 'maya',
                metadata: { title: 'Ocean Sunset', medium: 'Oil on Canvas', size: '48x36' },
            });
            expect(sale1.status).toBe('success');
            expect(sale1.splits[0]).toEqual({ party: 'artist-maya', role: 'creator', amount: 1800 });
            expect(sale1.splits[1]).toEqual({ party: 'gallery-soho', role: 'platform', amount: 360 });
            expect(sale1.splits[2]).toEqual({ party: 'agent-james', role: 'affiliate', amount: 240 });

            // 3. Capture sale of painting #2: $1,500
            await conduit.execute({
                action: 'capture',
                ruleId,
                amount: 1500,
                source: 'painting-morning-light',
                creator: 'maya',
            });

            // 4. Verify accumulated balances
            const artistBal = await conduit.execute({ action: 'balance', party: 'artist-maya' });
            const galleryBal = await conduit.execute({ action: 'balance', party: 'gallery-soho' });
            const agentBal = await conduit.execute({ action: 'balance', party: 'agent-james' });

            expect(artistBal.balance.available).toBe(2925);   // 1800 + 1125
            expect(galleryBal.balance.available).toBe(585);     // 360 + 225
            expect(agentBal.balance.available).toBe(390);       // 240 + 150

            // Total should equal all revenue
            const total = 2925 + 585 + 390;
            expect(total).toBe(3900); // 2400 + 1500

            // 5. Artist requests payout of $2,000
            const payout1 = await conduit.execute({
                action: 'payout',
                party: 'artist-maya',
                amount: 2000,
                destination: 'SOL:MayaWallet42',
                method: 'solana-spl',
                cycleId: 'CYCLE-2026-Q1',
            });
            expect(payout1.status).toBe('success');
            expect(payout1.payout.amount).toBe(2000);
            expect(payout1.remainingBalance).toBe(925);

            // 6. Gallery requests full payout
            const payout2 = await conduit.execute({
                action: 'payout',
                party: 'gallery-soho',
                destination: 'BANK:Gallery-Soho-ACH',
                method: 'bank-transfer',
            });
            expect(payout2.status).toBe('success');
            expect(payout2.payout.amount).toBe(585);
            expect(payout2.remainingBalance).toBe(0);

            // 7. Agent requests payout — below min threshold, should fail
            await conduit.execute({ action: 'configure', minPayout: 500 });
            const payout3 = await conduit.execute({
                action: 'payout',
                party: 'agent-james',
                destination: 'PAYPAL:james@email.com',
            });
            expect(payout3.status).toBe('error');
            expect(payout3.error).toContain('minimum payout');

            // 8. Lower threshold and retry
            await conduit.execute({ action: 'configure', minPayout: 10 });
            const payout4 = await conduit.execute({
                action: 'payout',
                party: 'agent-james',
                destination: 'PAYPAL:james@email.com',
                method: 'paypal',
            });
            expect(payout4.status).toBe('success');
            expect(payout4.payout.amount).toBe(390);

            // 9. Verify final platform status
            const status = await conduit.execute({ action: 'status' });
            expect(status.totalRevenue).toBe(3900);
            expect(status.totalDisbursed).toBe(2975);   // 2000 + 585 + 390
            expect(status.totalRetained).toBe(925);       // artist's remaining

            // 10. Verify payout history
            const history = await conduit.execute({ action: 'history' });
            expect(history.totalPayouts).toBe(3);
            expect(history.totalDisbursed).toBe(2975);

            // 11. Final balances integrity check
            const finalArtist = await conduit.execute({ action: 'balance', party: 'artist-maya' });
            expect(finalArtist.balance.totalEarned).toBe(2925);
            expect(finalArtist.balance.totalPaid).toBe(2000);
            expect(finalArtist.balance.available).toBe(925);

            const finalGallery = await conduit.execute({ action: 'balance', party: 'gallery-soho' });
            expect(finalGallery.balance.available).toBe(0);

            const finalAgent = await conduit.execute({ action: 'balance', party: 'agent-james' });
            expect(finalAgent.balance.available).toBe(0);
        });
    });

    // ═══════════════════════════════════════════════════════════
    // 9. EDGE CASES & SECURITY
    // ═══════════════════════════════════════════════════════════

    describe('edge cases', () => {
        it('handles single-party 100% split (no split)', async () => {
            const reg = await conduit.execute({
                action: 'registerRule',
                name: 'solo-creator',
                shares: [{ party: 'sole-creator', role: 'creator', percent: 100 }],
            });

            await conduit.execute({ action: 'capture', ruleId: reg.rule.id, amount: 999.99 });
            const bal = await conduit.execute({ action: 'balance', party: 'sole-creator' });
            expect(bal.balance.available).toBe(999.99);
        });

        it('handles very small amounts ($0.01)', async () => {
            const reg = await conduit.execute({
                action: 'registerRule',
                name: 'micro',
                shares: [
                    { party: 'a', role: 'creator', percent: 70 },
                    { party: 'b', role: 'platform', percent: 30 },
                ],
            });

            await conduit.execute({ action: 'capture', ruleId: reg.rule.id, amount: 0.01 });

            const balA = await conduit.execute({ action: 'balance', party: 'a' });
            const balB = await conduit.execute({ action: 'balance', party: 'b' });
            // Should not lose or create money
            expect(balA.balance.available + balB.balance.available).toBe(0.01);
        });

        it('handles large transaction ($1,000,000)', async () => {
            const reg = await conduit.execute({
                action: 'registerRule',
                name: 'whale',
                shares: [
                    { party: 'whale-creator', role: 'creator', percent: 85 },
                    { party: 'whale-platform', role: 'platform', percent: 15 },
                ],
            });

            await conduit.execute({ action: 'capture', ruleId: reg.rule.id, amount: 1_000_000 });

            const creator = await conduit.execute({ action: 'balance', party: 'whale-creator' });
            expect(creator.balance.available).toBe(850_000);
        });

        it('returns error for unknown action', async () => {
            const result = await conduit.execute({ action: 'destroy' });
            expect(result.status).toBe('error');
            expect(result.error).toContain('Unknown action');
        });

        it('negative multiplier is rejected', async () => {
            const reg = await conduit.execute({
                action: 'registerRule',
                name: 'neg',
                shares: [{ party: 'x', role: 'creator', percent: 100 }],
            });

            const result = await conduit.execute({
                action: 'capture',
                ruleId: reg.rule.id,
                amount: 100,
                multiplier: -2,
            });

            expect(result.status).toBe('error');
        });
    });
});

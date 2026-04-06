import { describe, it, expect } from 'vitest';

/**
 * Split Transaction — Painting Purchase
 *
 * Scenario: 3 people split the cost of a painting.
 * Validates: splitting logic, rounding, partial payments,
 * overpayment rejection, settlement, and receipt generation.
 */

// ── Split Transaction Logic ──────────────────────────────────

interface Participant {
    wallet: string;
    name: string;
    amountOwed: number;
    amountPaid: number;
}

interface SplitTransaction {
    id: string;
    item: string;
    totalPrice: number;
    participants: Participant[];
    status: 'pending' | 'partial' | 'settled' | 'failed';
    createdAt: string;
    settledAt: string | null;
}

function createSplitTransaction(
    item: string,
    totalPrice: number,
    wallets: Array<{ wallet: string; name: string }>
): SplitTransaction {
    if (totalPrice <= 0) throw new Error('Price must be positive');
    if (wallets.length < 1 || wallets.length > 3) throw new Error('1-3 participants required');
    if (new Set(wallets.map((w) => w.wallet)).size !== wallets.length)
        throw new Error('Duplicate wallets');

    const perPerson = Math.floor((totalPrice * 100) / wallets.length) / 100;
    const remainder = Math.round((totalPrice - perPerson * wallets.length) * 100) / 100;

    const participants: Participant[] = wallets.map((w, i) => ({
        wallet: w.wallet,
        name: w.name,
        amountOwed: i === 0 ? perPerson + remainder : perPerson,
        amountPaid: 0,
    }));

    return {
        id: `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        item,
        totalPrice,
        participants,
        status: 'pending',
        createdAt: new Date().toISOString(),
        settledAt: null,
    };
}

function makePayment(
    txn: SplitTransaction,
    wallet: string,
    amount: number
): { success: boolean; message: string } {
    if (txn.status === 'settled') return { success: false, message: 'Transaction already settled' };
    if (txn.status === 'failed') return { success: false, message: 'Transaction failed' };
    if (amount <= 0) return { success: false, message: 'Payment must be positive' };

    const participant = txn.participants.find((p) => p.wallet === wallet);
    if (!participant) return { success: false, message: 'Wallet not in transaction' };

    const remaining = Math.round((participant.amountOwed - participant.amountPaid) * 100) / 100;
    if (amount > remaining + 0.01)
        return { success: false, message: `Overpayment: owes $${remaining}, tried $${amount}` };

    participant.amountPaid = Math.round((participant.amountPaid + amount) * 100) / 100;

    const totalPaid = txn.participants.reduce((sum, p) => sum + p.amountPaid, 0);
    if (Math.abs(totalPaid - txn.totalPrice) < 0.01) {
        txn.status = 'settled';
        txn.settledAt = new Date().toISOString();
    } else {
        txn.status = 'partial';
    }

    return { success: true, message: `Payment of $${amount} accepted from ${participant.name}` };
}

function getReceipt(txn: SplitTransaction): Record<string, any> {
    return {
        transactionId: txn.id,
        item: txn.item,
        totalPrice: txn.totalPrice,
        status: txn.status,
        participants: txn.participants.map((p) => ({
            name: p.name,
            owed: p.amountOwed,
            paid: p.amountPaid,
            settled: Math.abs(p.amountOwed - p.amountPaid) < 0.01,
        })),
        fullySettled: txn.status === 'settled',
    };
}

// ── Payout Split Logic ───────────────────────────────────────

interface PayoutRecord {
    id: string;
    transactionId: string;
    sellerWallet: string;
    amount: number;
    fee: number;
    netPayout: number;
    payerBreakdown: Array<{ name: string; wallet: string; contributed: number }>;
    status: 'pending' | 'completed' | 'failed';
    createdAt: string;
}

function createPayout(
    txn: SplitTransaction,
    sellerWallet: string,
    feePercent: number = 2.5
): PayoutRecord {
    if (!sellerWallet) throw new Error('Seller wallet required');
    if (txn.status !== 'settled') throw new Error('Transaction must be settled before payout');
    if (feePercent < 0 || feePercent > 50) throw new Error('Fee must be 0-50%');
    if (txn.participants.some((p) => p.wallet === sellerWallet))
        throw new Error('Seller cannot be a buyer');

    const fee = Math.round(txn.totalPrice * (feePercent / 100) * 100) / 100;
    const netPayout = Math.round((txn.totalPrice - fee) * 100) / 100;

    return {
        id: `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        transactionId: txn.id,
        sellerWallet,
        amount: txn.totalPrice,
        fee,
        netPayout,
        payerBreakdown: txn.participants.map((p) => ({
            name: p.name,
            wallet: p.wallet,
            contributed: p.amountPaid,
        })),
        status: 'pending',
        createdAt: new Date().toISOString(),
    };
}

function executePayout(payout: PayoutRecord): { success: boolean; message: string } {
    if (payout.status === 'completed') return { success: false, message: 'Payout already completed' };
    if (payout.status === 'failed') return { success: false, message: 'Payout has failed' };
    if (payout.netPayout <= 0) return { success: false, message: 'Nothing to pay out' };

    payout.status = 'completed';
    return {
        success: true,
        message: `$${payout.netPayout} disbursed to ${payout.sellerWallet} (fee: $${payout.fee})`,
    };
}

function splitPayout(
    txn: SplitTransaction,
    sellerWallets: Array<{ wallet: string; percent: number }>,
    feePercent: number = 2.5
): PayoutRecord[] {
    if (!sellerWallets.length || sellerWallets.length > 3)
        throw new Error('1-3 seller wallets required');
    if (txn.status !== 'settled') throw new Error('Transaction must be settled before payout');

    const totalPercent = sellerWallets.reduce((sum, s) => sum + s.percent, 0);
    if (Math.abs(totalPercent - 100) > 0.01) throw new Error('Seller splits must total 100%');

    const dupes = new Set(sellerWallets.map((s) => s.wallet));
    if (dupes.size !== sellerWallets.length) throw new Error('Duplicate seller wallets');

    const fee = Math.round(txn.totalPrice * (feePercent / 100) * 100) / 100;
    const netTotal = Math.round((txn.totalPrice - fee) * 100) / 100;

    return sellerWallets.map((seller) => {
        const sellerNet = Math.round(netTotal * (seller.percent / 100) * 100) / 100;
        const sellerFee = Math.round(fee * (seller.percent / 100) * 100) / 100;
        return {
            id: `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            transactionId: txn.id,
            sellerWallet: seller.wallet,
            amount: Math.round(txn.totalPrice * (seller.percent / 100) * 100) / 100,
            fee: sellerFee,
            netPayout: sellerNet,
            payerBreakdown: txn.participants.map((p) => ({
                name: p.name,
                wallet: p.wallet,
                contributed: Math.round(p.amountPaid * (seller.percent / 100) * 100) / 100,
            })),
            status: 'pending' as const,
            createdAt: new Date().toISOString(),
        };
    });
}

// ── Tests ────────────────────────────────────────────────────

describe('Split Transaction — Painting Purchase', () => {
    const painting = {
        item: 'Abstract Ocean Canvas 48x36',
        price: 750.0,
    };

    const buyers = [
        { wallet: 'WAL-alice-001', name: 'Alice' },
        { wallet: 'WAL-bob-002', name: 'Bob' },
        { wallet: 'WAL-carol-003', name: 'Carol' },
    ];

    describe('PASS — create split transaction', () => {
        it('splits $750 painting evenly among 3 people', () => {
            const txn = createSplitTransaction(painting.item, painting.price, buyers);

            expect(txn.item).toBe('Abstract Ocean Canvas 48x36');
            expect(txn.totalPrice).toBe(750);
            expect(txn.participants).toHaveLength(3);
            expect(txn.status).toBe('pending');

            // $750 / 3 = $250.00 each (divides evenly)
            for (const p of txn.participants) {
                expect(p.amountOwed).toBe(250);
                expect(p.amountPaid).toBe(0);
            }
        });

        it('handles uneven split correctly ($100.00 among 3)', () => {
            const txn = createSplitTransaction('Small Print', 100.0, buyers);

            // $100 / 3 = $33.33 each, remainder $0.01 goes to first person
            const owedAmounts = txn.participants.map((p) => p.amountOwed);
            const totalOwed = owedAmounts.reduce((a, b) => a + b, 0);

            expect(Math.abs(totalOwed - 100.0)).toBeLessThan(0.02);
            expect(owedAmounts[0]).toBeGreaterThanOrEqual(owedAmounts[1]);
        });

        it('supports 2-person split', () => {
            const txn = createSplitTransaction(painting.item, painting.price, buyers.slice(0, 2));
            expect(txn.participants).toHaveLength(2);
            expect(txn.participants[0].amountOwed).toBe(375);
            expect(txn.participants[1].amountOwed).toBe(375);
        });

        it('supports single buyer (no split)', () => {
            const txn = createSplitTransaction(painting.item, painting.price, [buyers[0]]);
            expect(txn.participants).toHaveLength(1);
            expect(txn.participants[0].amountOwed).toBe(750);
        });
    });

    describe('PASS — payment processing', () => {
        it('accepts payment from each participant', () => {
            const txn = createSplitTransaction(painting.item, painting.price, buyers);

            const r1 = makePayment(txn, 'WAL-alice-001', 250);
            expect(r1.success).toBe(true);
            expect(txn.status).toBe('partial');

            const r2 = makePayment(txn, 'WAL-bob-002', 250);
            expect(r2.success).toBe(true);
            expect(txn.status).toBe('partial');

            const r3 = makePayment(txn, 'WAL-carol-003', 250);
            expect(r3.success).toBe(true);
            expect(txn.status).toBe('settled');
            expect(txn.settledAt).not.toBeNull();
        });

        it('accepts partial payments', () => {
            const txn = createSplitTransaction(painting.item, painting.price, buyers);

            makePayment(txn, 'WAL-alice-001', 100);
            expect(txn.participants[0].amountPaid).toBe(100);
            expect(txn.status).toBe('partial');

            makePayment(txn, 'WAL-alice-001', 150);
            expect(txn.participants[0].amountPaid).toBe(250);
        });

        it('settles after all partial payments complete', () => {
            const txn = createSplitTransaction(painting.item, painting.price, buyers);

            // Alice pays in 2 installments
            makePayment(txn, 'WAL-alice-001', 125);
            makePayment(txn, 'WAL-alice-001', 125);
            // Bob pays full
            makePayment(txn, 'WAL-bob-002', 250);
            // Carol pays in 3 installments
            makePayment(txn, 'WAL-carol-003', 100);
            makePayment(txn, 'WAL-carol-003', 100);
            makePayment(txn, 'WAL-carol-003', 50);

            expect(txn.status).toBe('settled');
        });
    });

    describe('FAIL — validation rejects bad input', () => {
        it('rejects more than 3 participants', () => {
            expect(() =>
                createSplitTransaction(painting.item, painting.price, [
                    ...buyers,
                    { wallet: 'WAL-dave-004', name: 'Dave' },
                ])
            ).toThrow('1-3 participants required');
        });

        it('rejects zero participants', () => {
            expect(() => createSplitTransaction(painting.item, painting.price, [])).toThrow(
                '1-3 participants required'
            );
        });

        it('rejects negative price', () => {
            expect(() => createSplitTransaction(painting.item, -500, buyers)).toThrow(
                'Price must be positive'
            );
        });

        it('rejects zero price', () => {
            expect(() => createSplitTransaction(painting.item, 0, buyers)).toThrow(
                'Price must be positive'
            );
        });

        it('rejects duplicate wallets', () => {
            expect(() =>
                createSplitTransaction(painting.item, painting.price, [
                    { wallet: 'same', name: 'A' },
                    { wallet: 'same', name: 'B' },
                ])
            ).toThrow('Duplicate wallets');
        });
    });

    describe('FAIL — payment rejects bad operations', () => {
        it('rejects overpayment', () => {
            const txn = createSplitTransaction(painting.item, painting.price, buyers);
            const result = makePayment(txn, 'WAL-alice-001', 300);

            expect(result.success).toBe(false);
            expect(result.message).toContain('Overpayment');
        });

        it('rejects payment from unknown wallet', () => {
            const txn = createSplitTransaction(painting.item, painting.price, buyers);
            const result = makePayment(txn, 'WAL-hacker-999', 250);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Wallet not in transaction');
        });

        it('rejects negative payment', () => {
            const txn = createSplitTransaction(painting.item, painting.price, buyers);
            const result = makePayment(txn, 'WAL-alice-001', -50);

            expect(result.success).toBe(false);
            expect(result.message).toBe('Payment must be positive');
        });

        it('rejects payment on settled transaction', () => {
            const txn = createSplitTransaction(painting.item, 30, [
                { wallet: 'w1', name: 'A' },
                { wallet: 'w2', name: 'B' },
                { wallet: 'w3', name: 'C' },
            ]);
            makePayment(txn, 'w1', 10);
            makePayment(txn, 'w2', 10);
            makePayment(txn, 'w3', 10);
            expect(txn.status).toBe('settled');

            const result = makePayment(txn, 'w1', 5);
            expect(result.success).toBe(false);
            expect(result.message).toBe('Transaction already settled');
        });
    });

    describe('PASS — receipt generation', () => {
        it('generates receipt with all participant details', () => {
            const txn = createSplitTransaction(painting.item, painting.price, buyers);
            makePayment(txn, 'WAL-alice-001', 250);
            makePayment(txn, 'WAL-bob-002', 250);

            const receipt = getReceipt(txn);

            expect(receipt.item).toBe('Abstract Ocean Canvas 48x36');
            expect(receipt.totalPrice).toBe(750);
            expect(receipt.fullySettled).toBe(false);
            expect(receipt.participants[0].settled).toBe(true);  // Alice paid
            expect(receipt.participants[1].settled).toBe(true);  // Bob paid
            expect(receipt.participants[2].settled).toBe(false); // Carol hasn't paid
        });

        it('shows fully settled receipt', () => {
            const txn = createSplitTransaction(painting.item, painting.price, buyers);
            makePayment(txn, 'WAL-alice-001', 250);
            makePayment(txn, 'WAL-bob-002', 250);
            makePayment(txn, 'WAL-carol-003', 250);

            const receipt = getReceipt(txn);

            expect(receipt.fullySettled).toBe(true);
            expect(receipt.status).toBe('settled');
            expect(receipt.participants.every((p: any) => p.settled)).toBe(true);
        });
    });

    describe('PASS — payout to seller', () => {
        function settledTxn() {
            const txn = createSplitTransaction(painting.item, painting.price, buyers);
            makePayment(txn, 'WAL-alice-001', 250);
            makePayment(txn, 'WAL-bob-002', 250);
            makePayment(txn, 'WAL-carol-003', 250);
            return txn;
        }

        it('creates payout with 2.5% platform fee', () => {
            const txn = settledTxn();
            const payout = createPayout(txn, 'WAL-seller-artist');

            expect(payout.sellerWallet).toBe('WAL-seller-artist');
            expect(payout.amount).toBe(750);
            expect(payout.fee).toBe(18.75);          // 2.5% of 750
            expect(payout.netPayout).toBe(731.25);    // 750 - 18.75
            expect(payout.status).toBe('pending');
            expect(payout.payerBreakdown).toHaveLength(3);
        });

        it('shows each buyer contribution in payout', () => {
            const txn = settledTxn();
            const payout = createPayout(txn, 'WAL-seller-artist');

            for (const entry of payout.payerBreakdown) {
                expect(entry.contributed).toBe(250);
            }
            expect(payout.payerBreakdown.map((e) => e.name)).toEqual(['Alice', 'Bob', 'Carol']);
        });

        it('executes payout successfully', () => {
            const txn = settledTxn();
            const payout = createPayout(txn, 'WAL-seller-artist');
            const result = executePayout(payout);

            expect(result.success).toBe(true);
            expect(result.message).toContain('731.25');
            expect(result.message).toContain('WAL-seller-artist');
            expect(payout.status).toBe('completed');
        });

        it('supports zero-fee payout', () => {
            const txn = settledTxn();
            const payout = createPayout(txn, 'WAL-seller-artist', 0);

            expect(payout.fee).toBe(0);
            expect(payout.netPayout).toBe(750);
        });

        it('supports custom fee percentage', () => {
            const txn = settledTxn();
            const payout = createPayout(txn, 'WAL-seller-artist', 5);

            expect(payout.fee).toBe(37.5);
            expect(payout.netPayout).toBe(712.5);
        });
    });

    describe('PASS — split payout to multiple sellers', () => {
        function settledTxn() {
            const txn = createSplitTransaction(painting.item, painting.price, buyers);
            makePayment(txn, 'WAL-alice-001', 250);
            makePayment(txn, 'WAL-bob-002', 250);
            makePayment(txn, 'WAL-carol-003', 250);
            return txn;
        }

        it('splits payout 50/50 between artist and gallery', () => {
            const txn = settledTxn();
            const payouts = splitPayout(txn, [
                { wallet: 'WAL-artist', percent: 50 },
                { wallet: 'WAL-gallery', percent: 50 },
            ]);

            expect(payouts).toHaveLength(2);
            expect(payouts[0].netPayout).toBe(365.63); // 50% of 731.25
            expect(payouts[1].netPayout).toBe(365.63);
        });

        it('splits payout 70/20/10 among 3 sellers', () => {
            const txn = settledTxn();
            const payouts = splitPayout(txn, [
                { wallet: 'WAL-artist', percent: 70 },
                { wallet: 'WAL-gallery', percent: 20 },
                { wallet: 'WAL-agent', percent: 10 },
            ]);

            expect(payouts).toHaveLength(3);
            expect(payouts[0].netPayout).toBe(511.87); // 70% of 731.25
            expect(payouts[1].netPayout).toBe(146.25); // 20% of 731.25
            expect(payouts[2].netPayout).toBe(73.13);  // 10% of 731.25

            // All payouts should be pending
            for (const p of payouts) {
                expect(p.status).toBe('pending');
            }
        });

        it('executes each split payout independently', () => {
            const txn = settledTxn();
            const payouts = splitPayout(txn, [
                { wallet: 'WAL-artist', percent: 60 },
                { wallet: 'WAL-gallery', percent: 40 },
            ]);

            const r1 = executePayout(payouts[0]);
            expect(r1.success).toBe(true);
            expect(payouts[0].status).toBe('completed');
            expect(payouts[1].status).toBe('pending'); // independent

            const r2 = executePayout(payouts[1]);
            expect(r2.success).toBe(true);
            expect(payouts[1].status).toBe('completed');
        });
    });

    describe('FAIL — payout rejects bad operations', () => {
        function settledTxn() {
            const txn = createSplitTransaction(painting.item, painting.price, buyers);
            makePayment(txn, 'WAL-alice-001', 250);
            makePayment(txn, 'WAL-bob-002', 250);
            makePayment(txn, 'WAL-carol-003', 250);
            return txn;
        }

        it('rejects payout on unsettled transaction', () => {
            const txn = createSplitTransaction(painting.item, painting.price, buyers);
            makePayment(txn, 'WAL-alice-001', 250); // only partial

            expect(() => createPayout(txn, 'WAL-seller')).toThrow('Transaction must be settled');
        });

        it('rejects payout without seller wallet', () => {
            const txn = settledTxn();
            expect(() => createPayout(txn, '')).toThrow('Seller wallet required');
        });

        it('rejects payout when seller is also a buyer', () => {
            const txn = settledTxn();
            expect(() => createPayout(txn, 'WAL-alice-001')).toThrow('Seller cannot be a buyer');
        });

        it('rejects fee over 50%', () => {
            const txn = settledTxn();
            expect(() => createPayout(txn, 'WAL-seller', 60)).toThrow('Fee must be 0-50%');
        });

        it('rejects duplicate payout execution', () => {
            const txn = settledTxn();
            const payout = createPayout(txn, 'WAL-seller');
            executePayout(payout);
            const r2 = executePayout(payout);

            expect(r2.success).toBe(false);
            expect(r2.message).toBe('Payout already completed');
        });

        it('rejects split payout that does not total 100%', () => {
            const txn = settledTxn();
            expect(() =>
                splitPayout(txn, [
                    { wallet: 'WAL-a', percent: 50 },
                    { wallet: 'WAL-b', percent: 30 },
                ])
            ).toThrow('Seller splits must total 100%');
        });

        it('rejects duplicate seller wallets in split', () => {
            const txn = settledTxn();
            expect(() =>
                splitPayout(txn, [
                    { wallet: 'WAL-same', percent: 50 },
                    { wallet: 'WAL-same', percent: 50 },
                ])
            ).toThrow('Duplicate seller wallets');
        });

        it('rejects more than 3 seller wallets', () => {
            const txn = settledTxn();
            expect(() =>
                splitPayout(txn, [
                    { wallet: 'a', percent: 25 },
                    { wallet: 'b', percent: 25 },
                    { wallet: 'c', percent: 25 },
                    { wallet: 'd', percent: 25 },
                ])
            ).toThrow('1-3 seller wallets required');
        });
    });
});

/**
 * Relay — Gasless Solana Transaction Engine
 *
 * Accepts signed transactions from businesses and end-users,
 * wraps them with fee sponsorship, and submits to Solana.
 * The caller never pays gas — the platform absorbs or batches fees.
 *
 * Core flow:
 *   1. Business submits a serialized transaction (or intent)
 *   2. Relay validates, estimates compute, sponsors the fee
 *   3. Transaction is signed by the platform relayer keypair
 *   4. Submitted to Solana RPC (or queued for batch submission)
 *   5. Confirmation tracked + webhook fired on finality
 *
 * Actions:
 *   submit        — Submit a gasless transaction
 *   estimate      — Estimate compute units + fee for a transaction
 *   status        — Check status of a submitted transaction
 *   history       — Transaction history for a business / wallet
 *   balance       — Relayer fee pool balance
 *   fund          — Add funds to the relayer fee pool
 *   configure     — Update relay settings
 *   stats         — Platform-wide relay statistics
 */
export class Relay {
    // ── Fee pool ─────────────────────────────────────────────
    private feePool = {
        balance: 0,         // SOL available for sponsoring fees
        totalFunded: 0,
        totalSpent: 0,
    };

    // ── Transaction log ──────────────────────────────────────
    private transactions: Array<{
        id: string;
        businessId: string;
        wallet: string;
        type: string;
        payload: Record<string, any>;
        computeUnits: number;
        fee: number;
        status: 'pending' | 'submitted' | 'confirmed' | 'failed';
        signature: string | null;
        error: string | null;
        submittedAt: string;
        confirmedAt: string | null;
        metadata: Record<string, any>;
    }> = [];

    // ── Configuration ────────────────────────────────────────
    private config = {
        maxComputeUnits: 400_000,           // per transaction
        baseFee: 0.000005,                  // SOL — base fee per tx
        priorityFeePerCU: 0.00000001,       // SOL — per compute unit
        maxPendingPerBusiness: 50,
        batchingEnabled: false,
        batchIntervalMs: 1000,
        networkEndpoint: 'mainnet-beta',
    };

    // ── Business registry ────────────────────────────────────
    private businesses: Map<string, {
        id: string;
        name: string;
        wallet: string;
        sponsoredTxCount: number;
        totalFeesSponsored: number;
        dailyLimit: number;
        dailyUsed: number;
        dailyResetAt: string;
        createdAt: string;
    }> = new Map();

    // ═══════════════════════════════════════════════════════════
    async execute(data: Record<string, any>): Promise<Record<string, any>> {
        const action = data.action || 'stats';

        switch (action) {
            case 'submit': return this.submitTransaction(data);
            case 'estimate': return this.estimateFee(data);
            case 'status': return this.getTransactionStatus(data);
            case 'history': return this.getHistory(data);
            case 'balance': return this.getFeePoolBalance();
            case 'fund': return this.fundFeePool(data);
            case 'registerBusiness': return this.registerBusiness(data);
            case 'configure': return this.updateConfig(data);
            case 'stats': return this.getStats();
            default:
                return { status: 'error', engine: 'Relay', error: `Unknown action: ${action}` };
        }
    }

    // ── 1. Submit gasless transaction ────────────────────────

    private submitTransaction(data: Record<string, any>): Record<string, any> {
        const businessId = data.businessId as string;
        const wallet = data.wallet as string;
        const type = (data.type as string) || 'transfer';
        const payload = data.payload || {};
        const computeUnits = Math.min(Number(data.computeUnits) || 200_000, this.config.maxComputeUnits);
        const metadata = data.metadata || {};

        if (!businessId) return { status: 'error', engine: 'Relay', error: 'Missing businessId' };
        if (!wallet) return { status: 'error', engine: 'Relay', error: 'Missing wallet address' };

        // Validate business exists
        const business = this.businesses.get(businessId);
        if (!business) return { status: 'error', engine: 'Relay', error: `Business not found: ${businessId}` };

        // Check daily limit
        this.resetDailyIfNeeded(business);
        if (business.dailyUsed >= business.dailyLimit) {
            return { status: 'error', engine: 'Relay', error: 'Daily transaction limit reached' };
        }

        // Check pending transaction limit
        const pendingCount = this.transactions.filter(
            (t) => t.businessId === businessId && t.status === 'pending'
        ).length;
        if (pendingCount >= this.config.maxPendingPerBusiness) {
            return { status: 'error', engine: 'Relay', error: 'Too many pending transactions' };
        }

        // Calculate fee
        const fee = this.calculateFee(computeUnits);

        // Check fee pool
        if (this.feePool.balance < fee) {
            return { status: 'error', engine: 'Relay', error: 'Insufficient fee pool balance' };
        }

        // Deduct fee from pool
        this.feePool.balance = Math.round((this.feePool.balance - fee) * 1e9) / 1e9;
        this.feePool.totalSpent = Math.round((this.feePool.totalSpent + fee) * 1e9) / 1e9;

        // Update business counters
        business.sponsoredTxCount += 1;
        business.totalFeesSponsored = Math.round((business.totalFeesSponsored + fee) * 1e9) / 1e9;
        business.dailyUsed += 1;

        // Simulate transaction submission
        // In production: serialize → sign with relayer keypair → submit to Solana RPC
        const txId = `TX-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const signature = `sig-${Math.random().toString(36).slice(2, 14)}${Math.random().toString(36).slice(2, 14)}`;

        const tx = {
            id: txId,
            businessId,
            wallet,
            type,
            payload,
            computeUnits,
            fee,
            status: 'confirmed' as const,  // Simulated instant confirmation
            signature,
            error: null,
            submittedAt: new Date().toISOString(),
            confirmedAt: new Date().toISOString(),
            metadata,
        };
        this.transactions.push(tx);

        return {
            status: 'success',
            engine: 'Relay',
            transaction: {
                id: txId,
                signature,
                status: 'confirmed',
                computeUnits,
                fee,
                gasless: true,
                sponsoredBy: 'platform-relayer',
            },
            businessDailyRemaining: business.dailyLimit - business.dailyUsed,
        };
    }

    // ── 2. Estimate fee ──────────────────────────────────────

    private estimateFee(data: Record<string, any>): Record<string, any> {
        const computeUnits = Math.min(Number(data.computeUnits) || 200_000, this.config.maxComputeUnits);
        const type = (data.type as string) || 'transfer';

        const fee = this.calculateFee(computeUnits);

        return {
            status: 'success',
            engine: 'Relay',
            estimate: {
                type,
                computeUnits,
                baseFee: this.config.baseFee,
                priorityFee: Math.round(computeUnits * this.config.priorityFeePerCU * 1e9) / 1e9,
                totalFee: fee,
                currency: 'SOL',
                gasless: true,
                paidBy: 'platform',
            },
        };
    }

    // ── 3. Transaction status ────────────────────────────────

    private getTransactionStatus(data: Record<string, any>): Record<string, any> {
        const txId = data.txId as string;
        if (!txId) return { status: 'error', engine: 'Relay', error: 'Missing txId' };

        const tx = this.transactions.find((t) => t.id === txId);
        if (!tx) return { status: 'error', engine: 'Relay', error: `Transaction not found: ${txId}` };

        return {
            status: 'success',
            engine: 'Relay',
            transaction: {
                id: tx.id,
                businessId: tx.businessId,
                wallet: tx.wallet,
                type: tx.type,
                signature: tx.signature,
                status: tx.status,
                computeUnits: tx.computeUnits,
                fee: tx.fee,
                submittedAt: tx.submittedAt,
                confirmedAt: tx.confirmedAt,
                error: tx.error,
            },
        };
    }

    // ── 4. Transaction history ───────────────────────────────

    private getHistory(data: Record<string, any>): Record<string, any> {
        const businessId = data.businessId as string;
        const wallet = data.wallet as string;
        const limit = Math.min(Number(data.limit) || 50, 500);

        let txs = this.transactions;
        if (businessId) txs = txs.filter((t) => t.businessId === businessId);
        if (wallet) txs = txs.filter((t) => t.wallet === wallet);

        const totalFees = txs.reduce((s, t) => s + t.fee, 0);

        return {
            status: 'success',
            engine: 'Relay',
            totalTransactions: txs.length,
            totalFeesSponsored: Math.round(totalFees * 1e9) / 1e9,
            transactions: txs.slice(-limit).map((t) => ({
                id: t.id,
                type: t.type,
                status: t.status,
                fee: t.fee,
                signature: t.signature,
                submittedAt: t.submittedAt,
            })),
        };
    }

    // ── 5. Fee pool balance ──────────────────────────────────

    private getFeePoolBalance(): Record<string, any> {
        return {
            status: 'success',
            engine: 'Relay',
            feePool: { ...this.feePool },
            currency: 'SOL',
        };
    }

    // ── 6. Fund fee pool ─────────────────────────────────────

    private fundFeePool(data: Record<string, any>): Record<string, any> {
        const amount = Number(data.amount);
        const source = (data.source as string) || 'manual';

        if (!isFinite(amount) || amount <= 0)
            return { status: 'error', engine: 'Relay', error: 'Amount must be positive' };

        this.feePool.balance = Math.round((this.feePool.balance + amount) * 1e9) / 1e9;
        this.feePool.totalFunded = Math.round((this.feePool.totalFunded + amount) * 1e9) / 1e9;

        return {
            status: 'success',
            engine: 'Relay',
            funded: amount,
            feePool: { ...this.feePool },
            source,
        };
    }

    // ── 7. Register business ─────────────────────────────────

    private registerBusiness(data: Record<string, any>): Record<string, any> {
        const name = data.name as string;
        const wallet = data.wallet as string;
        const dailyLimit = Number(data.dailyLimit) || 1000;

        if (!name) return { status: 'error', engine: 'Relay', error: 'Missing business name' };
        if (!wallet) return { status: 'error', engine: 'Relay', error: 'Missing business wallet' };

        const id = `BIZ-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const now = new Date();
        const resetAt = new Date(now);
        resetAt.setUTCHours(0, 0, 0, 0);
        resetAt.setUTCDate(resetAt.getUTCDate() + 1);

        this.businesses.set(id, {
            id,
            name,
            wallet,
            sponsoredTxCount: 0,
            totalFeesSponsored: 0,
            dailyLimit,
            dailyUsed: 0,
            dailyResetAt: resetAt.toISOString(),
            createdAt: now.toISOString(),
        });

        return {
            status: 'success',
            engine: 'Relay',
            business: { id, name, wallet, dailyLimit },
        };
    }

    // ── 8. Configuration ─────────────────────────────────────

    private updateConfig(data: Record<string, any>): Record<string, any> {
        if (data.maxComputeUnits !== undefined) this.config.maxComputeUnits = Number(data.maxComputeUnits);
        if (data.baseFee !== undefined) this.config.baseFee = Number(data.baseFee);
        if (data.priorityFeePerCU !== undefined) this.config.priorityFeePerCU = Number(data.priorityFeePerCU);
        if (data.maxPendingPerBusiness !== undefined) this.config.maxPendingPerBusiness = Number(data.maxPendingPerBusiness);
        if (data.batchingEnabled !== undefined) this.config.batchingEnabled = Boolean(data.batchingEnabled);
        if (data.networkEndpoint !== undefined) this.config.networkEndpoint = String(data.networkEndpoint);

        return { status: 'success', engine: 'Relay', config: { ...this.config } };
    }

    // ── 9. Platform stats ────────────────────────────────────

    private getStats(): Record<string, any> {
        const confirmed = this.transactions.filter((t) => t.status === 'confirmed').length;
        const failed = this.transactions.filter((t) => t.status === 'failed').length;
        const pending = this.transactions.filter((t) => t.status === 'pending').length;

        return {
            status: 'success',
            engine: 'Relay',
            totalTransactions: this.transactions.length,
            confirmed,
            failed,
            pending,
            totalFeesSponsored: this.feePool.totalSpent,
            feePoolBalance: this.feePool.balance,
            registeredBusinesses: this.businesses.size,
            config: { ...this.config },
        };
    }

    // ── Helpers ──────────────────────────────────────────────

    private calculateFee(computeUnits: number): number {
        const priorityFee = computeUnits * this.config.priorityFeePerCU;
        return Math.round((this.config.baseFee + priorityFee) * 1e9) / 1e9;
    }

    private resetDailyIfNeeded(business: {
        dailyUsed: number;
        dailyResetAt: string;
    }): void {
        const now = new Date();
        const resetAt = new Date(business.dailyResetAt);
        if (now >= resetAt) {
            business.dailyUsed = 0;
            const nextReset = new Date(now);
            nextReset.setUTCHours(0, 0, 0, 0);
            nextReset.setUTCDate(nextReset.getUTCDate() + 1);
            business.dailyResetAt = nextReset.toISOString();
        }
    }
}

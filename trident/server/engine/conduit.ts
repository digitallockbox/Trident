/**
 * Conduit — Split-Payment & Payout Engine
 *
 * Revenue splitting, balance tracking, and payout disbursement.
 * Every unit of revenue that enters the platform is broken into
 * predefined shares and routed to the correct party with full
 * traceability through deterministic math.
 *
 * Core flow:
 *   1. Capture revenue event  →  split into shares
 *   2. Accumulate balances    →  creator / platform / affiliate ledgers
 *   3. Payout on request      →  validate, execute, record
 */
export class Conduit {
    // ── Split-rule registry ──────────────────────────────────
    private splitRules: Map<
        string,
        {
            id: string;
            name: string;
            shares: Array<{ party: string; role: 'creator' | 'platform' | 'affiliate' | 'custom'; percent: number }>;
            createdAt: string;
        }
    > = new Map();

    // ── Ledger balances ──────────────────────────────────────
    private balances: Map<string, { available: number; pending: number; totalEarned: number; totalPaid: number }> =
        new Map();

    // ── Revenue events ───────────────────────────────────────
    private revenueEvents: Array<{
        id: string;
        ruleId: string;
        amount: number;
        source: string;
        creator: string;
        splits: Array<{ party: string; role: string; amount: number }>;
        metadata: Record<string, any>;
        timestamp: string;
    }> = [];

    // ── Payout history ───────────────────────────────────────
    private payoutHistory: Array<{
        id: string;
        party: string;
        amount: number;
        destination: string;
        method: string;
        cycleId: string;
        status: 'completed' | 'failed';
        timestamp: string;
    }> = [];

    // ── Configuration ────────────────────────────────────────
    private config = {
        minPayout: 10,
        cooldownMs: 0,
        maxPayoutPerCycle: Infinity,
    };

    private lastPayoutTime: Map<string, number> = new Map();

    // ═══════════════════════════════════════════════════════════
    async execute(data: Record<string, any>): Promise<Record<string, any>> {
        const action = data.action || 'status';

        switch (action) {
            case 'registerRule':
                return this.registerRule(data);
            case 'removeRule':
                return this.removeRule(data);
            case 'listRules':
                return this.listRules();
            case 'capture':
                return this.captureRevenue(data);
            case 'balance':
                return this.getBalance(data);
            case 'payout':
                return this.requestPayout(data);
            case 'ledger':
                return this.getLedger(data);
            case 'history':
                return this.getPayoutHistory(data);
            case 'configure':
                return this.updateConfig(data);
            case 'status':
                return this.platformStatus();
            default:
                return { status: 'error', engine: 'Conduit', error: `Unknown action: ${action}` };
        }
    }

    // ── 1. Split-rule management ─────────────────────────────

    private registerRule(data: Record<string, any>): Record<string, any> {
        const name = data.name as string;
        const shares = data.shares as Array<{ party: string; role: string; percent: number }> | undefined;

        if (!name) return { status: 'error', engine: 'Conduit', error: 'Missing rule name' };
        if (!shares || !Array.isArray(shares) || shares.length === 0)
            return { status: 'error', engine: 'Conduit', error: 'Shares array required' };

        const totalPct = shares.reduce((s, sh) => s + sh.percent, 0);
        if (Math.abs(totalPct - 100) > 0.01)
            return { status: 'error', engine: 'Conduit', error: `Shares must total 100%, got ${totalPct}%` };

        for (const sh of shares) {
            if (!sh.party) return { status: 'error', engine: 'Conduit', error: 'Each share needs a party' };
            if (sh.percent <= 0) return { status: 'error', engine: 'Conduit', error: 'Percent must be > 0' };
        }

        const id = `RULE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const validRoles = ['creator', 'platform', 'affiliate', 'custom'];
        this.splitRules.set(id, {
            id,
            name,
            shares: shares.map((sh) => ({
                party: sh.party,
                role: (validRoles.includes(sh.role) ? sh.role : 'custom') as any,
                percent: sh.percent,
            })),
            createdAt: new Date().toISOString(),
        });

        return { status: 'success', engine: 'Conduit', rule: this.splitRules.get(id) };
    }

    private removeRule(data: Record<string, any>): Record<string, any> {
        const ruleId = data.ruleId as string;
        if (!ruleId || !this.splitRules.has(ruleId))
            return { status: 'error', engine: 'Conduit', error: 'Rule not found' };

        this.splitRules.delete(ruleId);
        return { status: 'success', engine: 'Conduit', removed: ruleId };
    }

    private listRules(): Record<string, any> {
        return {
            status: 'success',
            engine: 'Conduit',
            totalRules: this.splitRules.size,
            rules: Array.from(this.splitRules.values()),
        };
    }

    // ── 2. Revenue capture & splitting ───────────────────────

    private captureRevenue(data: Record<string, any>): Record<string, any> {
        const ruleId = data.ruleId as string;
        const amount = Number(data.amount);
        const source = (data.source as string) || 'unknown';
        const creator = (data.creator as string) || 'unknown';
        const multiplier = Number(data.multiplier) || 1;
        const metadata = data.metadata || {};

        if (!ruleId || !this.splitRules.has(ruleId))
            return { status: 'error', engine: 'Conduit', error: 'Invalid rule ID' };
        if (!isFinite(amount) || amount <= 0)
            return { status: 'error', engine: 'Conduit', error: 'Amount must be positive' };
        if (multiplier < 0)
            return { status: 'error', engine: 'Conduit', error: 'Multiplier cannot be negative' };

        const rule = this.splitRules.get(ruleId)!;
        const effectiveAmount = Math.round(amount * multiplier * 100) / 100;

        const splits: Array<{ party: string; role: string; amount: number }> = [];
        let distributed = 0;

        for (let i = 0; i < rule.shares.length; i++) {
            const sh = rule.shares[i];
            let shareAmount: number;

            if (i === rule.shares.length - 1) {
                // Last share gets remainder to avoid rounding drift
                shareAmount = Math.round((effectiveAmount - distributed) * 100) / 100;
            } else {
                shareAmount = Math.round(effectiveAmount * (sh.percent / 100) * 100) / 100;
            }

            distributed += shareAmount;
            splits.push({ party: sh.party, role: sh.role, amount: shareAmount });

            // Update balance ledger
            this.creditBalance(sh.party, shareAmount);
        }

        const eventId = `REV-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        this.revenueEvents.push({
            id: eventId,
            ruleId,
            amount: effectiveAmount,
            source,
            creator,
            splits,
            metadata,
            timestamp: new Date().toISOString(),
        });

        return {
            status: 'success',
            engine: 'Conduit',
            eventId,
            grossAmount: effectiveAmount,
            splits,
            balancesUpdated: splits.length,
        };
    }

    private creditBalance(party: string, amount: number): void {
        const bal = this.balances.get(party) || { available: 0, pending: 0, totalEarned: 0, totalPaid: 0 };
        bal.available = Math.round((bal.available + amount) * 100) / 100;
        bal.totalEarned = Math.round((bal.totalEarned + amount) * 100) / 100;
        this.balances.set(party, bal);
    }

    // ── 3. Balance queries ───────────────────────────────────

    private getBalance(data: Record<string, any>): Record<string, any> {
        const party = data.party as string;
        if (!party) return { status: 'error', engine: 'Conduit', error: 'Missing party' };

        const bal = this.balances.get(party);
        if (!bal)
            return { status: 'success', engine: 'Conduit', party, balance: { available: 0, pending: 0, totalEarned: 0, totalPaid: 0 } };

        return { status: 'success', engine: 'Conduit', party, balance: { ...bal } };
    }

    private getLedger(data: Record<string, any>): Record<string, any> {
        const party = data.party as string;
        const limit = Math.min(Number(data.limit) || 50, 500);

        let events = this.revenueEvents;
        if (party) {
            events = events.filter((e) => e.splits.some((s) => s.party === party));
        }

        return {
            status: 'success',
            engine: 'Conduit',
            totalEvents: events.length,
            events: events.slice(-limit),
        };
    }

    // ── 4. Payout processing ─────────────────────────────────

    private requestPayout(data: Record<string, any>): Record<string, any> {
        const party = data.party as string;
        const amount = data.amount !== undefined ? Number(data.amount) : undefined;
        const destination = (data.destination as string) || '';
        const method = (data.method as string) || 'internal';
        const cycleId = (data.cycleId as string) || `CYCLE-${Date.now()}`;

        if (!party) return { status: 'error', engine: 'Conduit', error: 'Missing party' };
        if (!destination) return { status: 'error', engine: 'Conduit', error: 'Missing destination' };

        const bal = this.balances.get(party);
        if (!bal || bal.available <= 0)
            return { status: 'error', engine: 'Conduit', error: 'No available balance' };

        // Determine payout amount
        const payoutAmount = amount !== undefined && isFinite(amount) ? amount : bal.available;
        if (payoutAmount <= 0) return { status: 'error', engine: 'Conduit', error: 'Amount must be positive' };

        // Min threshold
        if (payoutAmount < this.config.minPayout)
            return { status: 'error', engine: 'Conduit', error: `Below minimum payout ($${this.config.minPayout})` };

        // Cooldown check
        const lastPayout = this.lastPayoutTime.get(party) || 0;
        if (this.config.cooldownMs > 0 && Date.now() - lastPayout < this.config.cooldownMs)
            return { status: 'error', engine: 'Conduit', error: 'Payout cooldown active' };

        // Insufficient balance
        if (payoutAmount > bal.available + 0.01)
            return {
                status: 'error',
                engine: 'Conduit',
                error: `Insufficient balance: available $${bal.available}, requested $${payoutAmount}`,
            };

        // ── Sovereign Sync validation ──────────────────────────
        // Verify ledger integrity: totalEarned - totalPaid must equal available
        const expectedAvailable = Math.round((bal.totalEarned - bal.totalPaid) * 100) / 100;
        if (Math.abs(expectedAvailable - bal.available) > 0.01)
            return { status: 'error', engine: 'Conduit', error: 'Ledger integrity check failed' };

        // No negative balances
        if (bal.available < 0 || bal.totalPaid < 0)
            return { status: 'error', engine: 'Conduit', error: 'Negative balance detected' };

        // Max per cycle
        const cyclePayouts = this.payoutHistory
            .filter((p) => p.cycleId === cycleId && p.status === 'completed')
            .reduce((s, p) => s + p.amount, 0);
        if (cyclePayouts + payoutAmount > this.config.maxPayoutPerCycle)
            return { status: 'error', engine: 'Conduit', error: 'Cycle payout limit exceeded' };

        // ── Execute ────────────────────────────────────────────
        const actualPayout = Math.min(payoutAmount, bal.available);
        bal.available = Math.round((bal.available - actualPayout) * 100) / 100;
        bal.totalPaid = Math.round((bal.totalPaid + actualPayout) * 100) / 100;
        this.lastPayoutTime.set(party, Date.now());

        const payoutId = `PAY-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        this.payoutHistory.push({
            id: payoutId,
            party,
            amount: actualPayout,
            destination,
            method,
            cycleId,
            status: 'completed',
            timestamp: new Date().toISOString(),
        });

        return {
            status: 'success',
            engine: 'Conduit',
            payout: {
                id: payoutId,
                party,
                amount: actualPayout,
                destination,
                method,
                cycleId,
            },
            remainingBalance: bal.available,
        };
    }

    // ── 5. Payout history ────────────────────────────────────

    private getPayoutHistory(data: Record<string, any>): Record<string, any> {
        const party = data.party as string;
        const limit = Math.min(Number(data.limit) || 50, 500);

        let history = this.payoutHistory;
        if (party) history = history.filter((p) => p.party === party);

        const totalDisbursed = history.filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0);

        return {
            status: 'success',
            engine: 'Conduit',
            totalPayouts: history.length,
            totalDisbursed: Math.round(totalDisbursed * 100) / 100,
            payouts: history.slice(-limit),
        };
    }

    // ── 6. Configuration ─────────────────────────────────────

    private updateConfig(data: Record<string, any>): Record<string, any> {
        if (data.minPayout !== undefined) this.config.minPayout = Number(data.minPayout);
        if (data.cooldownMs !== undefined) this.config.cooldownMs = Number(data.cooldownMs);
        if (data.maxPayoutPerCycle !== undefined) this.config.maxPayoutPerCycle = Number(data.maxPayoutPerCycle);

        return { status: 'success', engine: 'Conduit', config: { ...this.config } };
    }

    // ── 7. Platform status ───────────────────────────────────

    private platformStatus(): Record<string, any> {
        let totalRevenue = 0;
        let totalDisbursed = 0;
        for (const e of this.revenueEvents) totalRevenue += e.amount;
        for (const p of this.payoutHistory) if (p.status === 'completed') totalDisbursed += p.amount;

        const parties: Record<string, any> = {};
        for (const [party, bal] of this.balances.entries()) {
            parties[party] = { ...bal };
        }

        return {
            status: 'success',
            engine: 'Conduit',
            totalRevenue: Math.round(totalRevenue * 100) / 100,
            totalDisbursed: Math.round(totalDisbursed * 100) / 100,
            totalRetained: Math.round((totalRevenue - totalDisbursed) * 100) / 100,
            activeRules: this.splitRules.size,
            totalEvents: this.revenueEvents.length,
            totalPayouts: this.payoutHistory.length,
            parties,
            config: { ...this.config },
        };
    }
}

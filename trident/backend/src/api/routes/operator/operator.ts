import { Router, Request, Response } from 'express';
import { requireSession } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import { listAuditLogs, recordAuditLog } from '../../../utils/auditTrail';

interface OperatorState {
    cycleState: 'running' | 'frozen';
    cycleProgress: number;
    rpcTarget: 'primary' | 'failover';
    unhealthyRpcTargets: string[];
    dismissedFraudSignalIds: string[];
    replayedPayoutIds: string[];
}

const operatorState: OperatorState = {
    cycleState: 'running',
    cycleProgress: 0,
    rpcTarget: 'primary',
    unhealthyRpcTargets: [],
    dismissedFraudSignalIds: [],
    replayedPayoutIds: [],
};

const router = Router();

const getActor = (req: Request) => ({
    wallet: req.user?.wallet || 'unknown-wallet',
    role: req.user?.role || 'unknown-role',
});

router.get('/audit/logs', requireSession, requireRole(['admin', 'founder']), (req: Request, res: Response) => {
    const parsed = Number(req.query.limit ?? 100);
    const limit = Number.isFinite(parsed) ? parsed : 100;
    res.json({ ok: true, items: listAuditLogs(limit) });
});

router.post('/cycle/override', requireSession, requireRole('founder'), async (req: Request, res: Response) => {
    const { action } = req.body as { action?: string };
    const actor = getActor(req);

    try {
        let result: Record<string, unknown> = {};

        switch (action) {
            case 'end_now':
                operatorState.cycleProgress = 100;
                result = { cycleProgress: operatorState.cycleProgress };
                break;
            case 'reset':
                operatorState.cycleProgress = 0;
                result = { cycleProgress: operatorState.cycleProgress };
                break;
            case 'freeze':
                operatorState.cycleState = 'frozen';
                result = { cycleState: operatorState.cycleState };
                break;
            case 'unfreeze':
                operatorState.cycleState = 'running';
                result = { cycleState: operatorState.cycleState };
                break;
            default:
                res.status(400).json({ ok: false, error: 'Invalid cycle override action' });
                return;
        }

        const audit = await recordAuditLog({
            action: 'cycle.override',
            actorWallet: actor.wallet,
            actorRole: actor.role,
            target: 'cycle-engine',
            status: 'success',
            details: { action, result },
        });

        res.json({ ok: true, result, audit });
    } catch (error) {
        await recordAuditLog({
            action: 'cycle.override',
            actorWallet: actor.wallet,
            actorRole: actor.role,
            target: 'cycle-engine',
            status: 'error',
            details: { action, error: String(error) },
        });

        res.status(500).json({ ok: false, error: 'Failed to apply cycle override' });
    }
});

router.post('/rpc/switch', requireSession, requireRole('founder'), async (req: Request, res: Response) => {
    const { target } = req.body as { target?: 'primary' | 'failover' };
    const actor = getActor(req);

    try {
        if (target !== 'primary' && target !== 'failover') {
            res.status(400).json({ ok: false, error: 'Invalid RPC target' });
            return;
        }

        operatorState.rpcTarget = target;
        const result = {
            rpcTarget: operatorState.rpcTarget,
            switchedAt: new Date().toISOString(),
        };

        const audit = await recordAuditLog({
            action: 'rpc.switch',
            actorWallet: actor.wallet,
            actorRole: actor.role,
            target: 'rpc-router',
            status: 'success',
            details: { target, result },
        });

        res.json({ ok: true, result, audit });
    } catch (error) {
        await recordAuditLog({
            action: 'rpc.switch',
            actorWallet: actor.wallet,
            actorRole: actor.role,
            target: 'rpc-router',
            status: 'error',
            details: { target, error: String(error) },
        });

        res.status(500).json({ ok: false, error: 'Failed to switch RPC target' });
    }
});

router.post('/rpc/mark-unhealthy', requireSession, requireRole('founder'), async (req: Request, res: Response) => {
    const { target } = req.body as { target?: string };
    const actor = getActor(req);

    try {
        if (!target || typeof target !== 'string') {
            res.status(400).json({ ok: false, error: 'Invalid RPC target' });
            return;
        }

        if (!operatorState.unhealthyRpcTargets.includes(target)) {
            operatorState.unhealthyRpcTargets.push(target);
        }

        const result = { unhealthyRpcTargets: operatorState.unhealthyRpcTargets };
        const audit = await recordAuditLog({
            action: 'rpc.mark_unhealthy',
            actorWallet: actor.wallet,
            actorRole: actor.role,
            target: 'rpc-router',
            status: 'success',
            details: { target, result },
        });

        res.json({ ok: true, result, audit });
    } catch (error) {
        await recordAuditLog({
            action: 'rpc.mark_unhealthy',
            actorWallet: actor.wallet,
            actorRole: actor.role,
            target: 'rpc-router',
            status: 'error',
            details: { target, error: String(error) },
        });

        res.status(500).json({ ok: false, error: 'Failed to mark RPC as unhealthy' });
    }
});

router.post('/fraud/dismiss', requireSession, requireRole(['admin', 'founder']), async (req: Request, res: Response) => {
    const { id } = req.body as { id?: string };
    const actor = getActor(req);

    try {
        if (!id || typeof id !== 'string') {
            res.status(400).json({ ok: false, error: 'Invalid fraud signal id' });
            return;
        }

        if (!operatorState.dismissedFraudSignalIds.includes(id)) {
            operatorState.dismissedFraudSignalIds.push(id);
        }

        const result = { dismissed: id };
        const audit = await recordAuditLog({
            action: 'fraud.dismiss',
            actorWallet: actor.wallet,
            actorRole: actor.role,
            target: 'fraud-signal',
            status: 'success',
            details: { id, result },
        });

        res.json({ ok: true, result, audit });
    } catch (error) {
        await recordAuditLog({
            action: 'fraud.dismiss',
            actorWallet: actor.wallet,
            actorRole: actor.role,
            target: 'fraud-signal',
            status: 'error',
            details: { id, error: String(error) },
        });

        res.status(500).json({ ok: false, error: 'Failed to dismiss fraud signal' });
    }
});

router.post('/payout/replay', requireSession, requireRole(['admin', 'founder']), async (req: Request, res: Response) => {
    const { payoutId } = req.body as { payoutId?: string };
    const actor = getActor(req);

    try {
        if (!payoutId || typeof payoutId !== 'string') {
            res.status(400).json({ ok: false, error: 'Invalid payout id' });
            return;
        }

        if (!operatorState.replayedPayoutIds.includes(payoutId)) {
            operatorState.replayedPayoutIds.push(payoutId);
        }

        const result = {
            payoutId,
            replayedAt: new Date().toISOString(),
            replayCount: operatorState.replayedPayoutIds.length,
        };

        const audit = await recordAuditLog({
            action: 'payout.replay',
            actorWallet: actor.wallet,
            actorRole: actor.role,
            target: 'payout-engine',
            status: 'success',
            details: { payoutId, result },
        });

        res.json({ ok: true, result, audit });
    } catch (error) {
        await recordAuditLog({
            action: 'payout.replay',
            actorWallet: actor.wallet,
            actorRole: actor.role,
            target: 'payout-engine',
            status: 'error',
            details: { payoutId, error: String(error) },
        });

        res.status(500).json({ ok: false, error: 'Failed to replay payout' });
    }
});

router.post('/cycle/validate', requireSession, requireRole('founder'), async (req: Request, res: Response) => {
    const actor = getActor(req);

    try {
        const result = {
            valid: operatorState.cycleState === 'running',
            checkedAt: new Date().toISOString(),
        };

        const audit = await recordAuditLog({
            action: 'cycle.validate',
            actorWallet: actor.wallet,
            actorRole: actor.role,
            target: 'cycle-engine',
            status: 'success',
            details: { result },
        });

        res.json({ ok: true, result, audit });
    } catch (error) {
        await recordAuditLog({
            action: 'cycle.validate',
            actorWallet: actor.wallet,
            actorRole: actor.role,
            target: 'cycle-engine',
            status: 'error',
            details: { error: String(error) },
        });

        res.status(500).json({ ok: false, error: 'Manual validation failed' });
    }
});

router.post('/engine/reset', requireSession, requireRole('founder'), async (req: Request, res: Response) => {
    const actor = getActor(req);

    try {
        operatorState.cycleProgress = 0;
        operatorState.cycleState = 'running';

        const result = {
            cycleProgress: operatorState.cycleProgress,
            cycleState: operatorState.cycleState,
            resetAt: new Date().toISOString(),
        };

        const audit = await recordAuditLog({
            action: 'engine.reset',
            actorWallet: actor.wallet,
            actorRole: actor.role,
            target: 'operator-engine',
            status: 'success',
            details: { result },
        });

        res.json({ ok: true, result, audit });
    } catch (error) {
        await recordAuditLog({
            action: 'engine.reset',
            actorWallet: actor.wallet,
            actorRole: actor.role,
            target: 'operator-engine',
            status: 'error',
            details: { error: String(error) },
        });

        res.status(500).json({ ok: false, error: 'Engine reset failed' });
    }
});

export default router;

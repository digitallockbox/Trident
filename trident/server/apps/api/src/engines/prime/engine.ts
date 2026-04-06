import { PrimePayload, PrimeResult } from './types';
import { auditLog } from '../../../audit-trail/services/audit-log.service';

export async function primeEngine(payload: PrimePayload): Promise<PrimeResult> {
    await auditLog({
        engine: 'prime',
        action: 'execute',
        payload,
        timestamp: new Date().toISOString(),
    });
    return {
        ok: true,
        message: 'Prime engine executed',
        data: { echo: payload },
    };
}

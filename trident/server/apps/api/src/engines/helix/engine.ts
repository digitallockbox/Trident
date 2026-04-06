import { HelixPayload, HelixResult } from './types';
import { auditLog } from '../../../audit-trail/services/audit-log.service';

export async function helixEngine(payload: HelixPayload): Promise<HelixResult> {
    await auditLog({
        engine: 'helix',
        action: 'execute',
        payload,
        timestamp: new Date().toISOString(),
    });
    return {
        ok: true,
        message: 'Helix engine executed',
        data: { echo: payload },
    };
}

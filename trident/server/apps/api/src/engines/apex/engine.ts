import { ApexPayload, ApexResult } from './types';
import { auditLog } from '../../../audit-trail/services/audit-log.service';

export async function apexEngine(payload: ApexPayload): Promise<ApexResult> {
    await auditLog({
        engine: 'apex',
        action: 'execute',
        payload,
        timestamp: new Date().toISOString(),
    });
    return {
        ok: true,
        message: 'Apex engine executed',
        data: { echo: payload },
    };
}

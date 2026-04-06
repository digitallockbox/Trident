import { OmegaPayload, OmegaResult } from '../types/omega';

export async function runOmegaEngine(
    payload: OmegaPayload
): Promise<OmegaResult> {
    const res = await fetch('/api/engines/omega/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.error ?? 'Omega engine failed');
    }

    return res.json();
}

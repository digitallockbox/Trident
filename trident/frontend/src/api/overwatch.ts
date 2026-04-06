import type { OverwatchPayload, OverwatchResult } from '../types/overwatch';

export async function runOverwatchEngine(payload: OverwatchPayload): Promise<OverwatchResult> {
    const res = await fetch('/api/overwatch/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || 'Failed to execute Overwatch engine');
    }
    return res.json();
}

// useOverwatchEngine.ts
// React hook for interacting with the Overwatch engine API

import { useState } from 'react';

export interface OverwatchEnginePayload {
    // Define your payload structure here
    target: string;
}

export interface OverwatchEngineResult {
    status: 'success' | 'error';
    result?: any;
    error?: string;
}

export function useOverwatchEngine() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<OverwatchEngineResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const execute = async (payload: OverwatchEnginePayload) => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await fetch('/api/engine/overwatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            setResult(data);
            if (data.status === 'error') setError(data.error || 'Unknown error');
        } catch (err: any) {
            setError(err.message || 'Network error');
        } finally {
            setLoading(false);
        }
    };

    return { execute, loading, result, error };
}

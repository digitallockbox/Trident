// useOmegaEngine.ts
// React hook for interacting with the Omega engine API

import { useState } from 'react';

export interface OmegaEnginePayload {
    numbers: number[];
    operation: 'sum' | 'product';
}

export interface OmegaEngineResult {
    status: 'success' | 'error';
    result?: number;
    error?: string;
    operation?: string;
    input?: number[];
}

export function useOmegaEngine() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<OmegaEngineResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const execute = async (payload: OmegaEnginePayload) => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await fetch('/api/engine/omega', {
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

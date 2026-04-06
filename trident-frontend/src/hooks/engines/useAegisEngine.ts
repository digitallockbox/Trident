// useAegisEngine.ts
// React hook for interacting with the Aegis engine API

import { useState } from 'react';

export interface AegisEnginePayload {
    // Define your payload structure here
    input: string;
}

export interface AegisEngineResult {
    status: 'success' | 'error';
    result?: any;
    error?: string;
}

export function useAegisEngine() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<AegisEngineResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const execute = async (payload: AegisEnginePayload) => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await fetch('/api/engine/aegis', {
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

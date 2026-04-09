// useOverwatchEngine.ts
// React hook for interacting with the Overwatch engine API
import { useState } from 'react';
export function useOverwatchEngine() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const execute = async (payload) => {
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
            if (data.status === 'error')
                setError(data.error || 'Unknown error');
        }
        catch (err) {
            setError(err.message || 'Network error');
        }
        finally {
            setLoading(false);
        }
    };
    return { execute, loading, result, error };
}

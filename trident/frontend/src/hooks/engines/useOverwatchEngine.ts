import { useCallback, useState } from 'react';

export function useOverwatchEngine() {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const execute = useCallback(async (payload) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/overwatch/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            setResult(data);
            return data;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { execute, result, loading, error };
}

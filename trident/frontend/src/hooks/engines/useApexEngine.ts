import { useCallback, useState } from 'react';
export function useApexEngine() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);
    const execute = useCallback(async (payload: Record<string, any>) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/apex/execute', {
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

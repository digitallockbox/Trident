// useParagonEngine.ts
import { useCallback } from 'react';

export function useParagonEngine() {
    const execute = useCallback(async (payload: Record<string, any>) => {
        const res = await fetch('/api/paragon/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return res.json();
    }, []);

    return { execute };
}

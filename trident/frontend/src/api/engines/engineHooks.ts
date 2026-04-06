import { useMutation } from '@tanstack/react-query';

export interface EngineResponse<T = any> {
    ok: boolean;
    message: string;
    data?: T;
    error?: string;
}

export function useAegisExecute() {
    return useMutation(async (payload: Record<string, any>) => {
        const res = await fetch('/api/aegis/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return res.json() as Promise<EngineResponse>;
    });
}

export function useParagonExecute() {
    return useMutation(async (payload: Record<string, any>) => {
        const res = await fetch('/api/paragon/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return res.json() as Promise<EngineResponse>;
    });
}

export function useApexExecute() {
    return useMutation(async (payload: Record<string, any>) => {
        const res = await fetch('/api/apex/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return res.json() as Promise<EngineResponse>;
    });
}

export function useOmegaExecute() {
    return useMutation(async (payload: Record<string, any>) => {
        const res = await fetch('/api/omega/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return res.json() as Promise<EngineResponse>;
    });
}

export function usePrimeExecute() {
    return useMutation(async (payload: Record<string, any>) => {
        const res = await fetch('/api/prime/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return res.json() as Promise<EngineResponse>;
    });
}

export function usePodcastExecute() {
    return useMutation(async (payload: Record<string, any>) => {
        const res = await fetch('/api/podcast/execute', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        return res.json() as Promise<EngineResponse>;
    });
}

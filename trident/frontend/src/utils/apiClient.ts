import { API_ROUTES } from './apiRoutes';

const rawBaseUrl = import.meta.env.VITE_API_URL ?? '';
const apiBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

const makeUrl = (path: string) => `${apiBaseUrl}${path}`;

export const apiClient = {
    getJson: async <T>(path: string, init?: RequestInit): Promise<T> => {
        const response = await fetch(makeUrl(path), {
            method: 'GET',
            credentials: 'include',
            ...init,
        });

        if (!response.ok) {
            throw new Error(`GET ${path} failed with status ${response.status}`);
        }

        return (await response.json()) as T;
    },

    getText: async (path: string, init?: RequestInit): Promise<string> => {
        const response = await fetch(makeUrl(path), {
            method: 'GET',
            credentials: 'include',
            ...init,
        });

        if (!response.ok) {
            throw new Error(`GET ${path} failed with status ${response.status}`);
        }

        return await response.text();
    },

    post: async (path: string, init?: RequestInit): Promise<Response> => {
        return await fetch(makeUrl(path), {
            method: 'POST',
            credentials: 'include',
            ...init,
        });
    },
};

export { API_ROUTES };

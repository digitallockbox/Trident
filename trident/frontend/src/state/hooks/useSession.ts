import { useEffect, useState } from "react";

export type SessionRole = "user" | "admin" | "founder" | null;

export interface Session {
    wallet: string | null;
    role: SessionRole;
    loading: boolean;
}

export function useSession(): Session {
    const [wallet, setWallet] = useState<string | null>(null);
    const [role, setRole] = useState<SessionRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${import.meta.env.VITE_API_URL}/profile`, {
            credentials: "include",
        })
            .then((res) => (res.ok ? res.json() : null))
            .then((data) => {
                setWallet(data?.wallet ?? null);
                setRole((data?.role as SessionRole) ?? null);
            })
            .catch(() => {
                setWallet(null);
                setRole(null);
            })
            .finally(() => setLoading(false));
    }, []);

    return { wallet, role, loading };
}

import { useState } from "react";
import { runOmegaEngine } from "../../api/omega";
import type { OmegaPayload, OmegaResult } from "../../types/omega";

export default function useOmegaEngine() {
    // Example: could be expanded to fetch engine status, config, etc.
    const [result, setResult] = useState<OmegaResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const execute = async (payload: OmegaPayload) => {
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await runOmegaEngine(payload);
            setResult(res);
        } catch (err: any) {
            setError(err?.message ?? "Unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return { execute, result, error, loading };
}

import { useEffect, useCallback } from "react";

export interface LiveEvent {
    type: "rpc_failover" | "fraud_signal" | "cycle_update" | "payout" | string;
    data: unknown;
}

export function useLiveEvents(onEvent: (event: LiveEvent) => void): void {
    const stableCallback = useCallback(onEvent, [onEvent]);

    useEffect(() => {
        const url = import.meta.env.VITE_WS_URL ?? "ws://localhost:8081";
        const ws = new WebSocket(url as string);

        ws.onmessage = (msg) => {
            try {
                stableCallback(JSON.parse(msg.data as string) as LiveEvent);
            } catch {
                // ignore malformed messages
            }
        };

        return () => {
            ws.close();
        };
    }, [stableCallback]);
}

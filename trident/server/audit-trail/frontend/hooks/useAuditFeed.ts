import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type AuditFeedSeverity = 'info' | 'warning' | 'critical' | 'emergency';

export interface AuditFeedEntry {
    id: string;
    timestamp: string;
    action: string;
    module: string;
    severity: AuditFeedSeverity;
    outcome: 'success' | 'failure' | 'denied';
    description: string;
    operatorWallet: string;
    operatorRole: string;
    endpoint: string;
    ipHash: string;
    metadata: Record<string, unknown>;
    correlationId?: string;
    previousChecksum?: string;
    checksum: string;
}

interface AuditFeedSocketPayload {
    type?: string;
    entry?: AuditFeedEntry;
    error?: string;
}

export interface UseAuditFeedOptions {
    url: string;
    maxEntries?: number;
    reconnectDelayMs?: number;
    severities?: AuditFeedSeverity[];
    autoStart?: boolean;
}

export interface UseAuditFeedResult {
    entries: AuditFeedEntry[];
    connected: boolean;
    paused: boolean;
    error: string | null;
    clear: () => void;
    pause: () => void;
    resume: () => void;
}

const DEFAULT_MAX_ENTRIES = 200;
const DEFAULT_RECONNECT_DELAY_MS = 2500;

export function useAuditFeed(options: UseAuditFeedOptions): UseAuditFeedResult {
    const {
        url,
        maxEntries = DEFAULT_MAX_ENTRIES,
        reconnectDelayMs = DEFAULT_RECONNECT_DELAY_MS,
        severities,
        autoStart = true,
    } = options;

    const [entries, setEntries] = useState<AuditFeedEntry[]>([]);
    const [connected, setConnected] = useState(false);
    const [paused, setPaused] = useState(!autoStart);
    const [error, setError] = useState<string | null>(null);

    const socketRef = useRef<WebSocket | null>(null);
    const reconnectTimerRef = useRef<number | null>(null);
    const reconnectingRef = useRef(false);

    const clearReconnectTimer = useCallback((): void => {
        if (reconnectTimerRef.current !== null) {
            window.clearTimeout(reconnectTimerRef.current);
            reconnectTimerRef.current = null;
        }
    }, []);

    const closeSocket = useCallback((): void => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
    }, []);

    const connect = useCallback((): void => {
        if (paused || !url) return;
        if (socketRef.current) return;

        try {
            const ws = new WebSocket(url);
            socketRef.current = ws;

            ws.onopen = () => {
                setConnected(true);
                setError(null);
                reconnectingRef.current = false;

                if (severities?.length) {
                    ws.send(JSON.stringify({ type: 'subscribe', severities }));
                }
            };

            ws.onmessage = (event: MessageEvent<string>) => {
                let payload: AuditFeedSocketPayload;
                try {
                    payload = JSON.parse(event.data) as AuditFeedSocketPayload;
                } catch {
                    return;
                }

                if (payload.type === 'audit-entry' && payload.entry) {
                    setEntries((prev) => [payload.entry as AuditFeedEntry, ...prev].slice(0, maxEntries));
                }

                if (payload.type === 'error' && payload.error) {
                    setError(payload.error);
                }
            };

            ws.onerror = () => {
                setError('Audit feed connection error');
            };

            ws.onclose = () => {
                setConnected(false);
                socketRef.current = null;

                if (!paused && !reconnectingRef.current) {
                    reconnectingRef.current = true;
                    clearReconnectTimer();
                    reconnectTimerRef.current = window.setTimeout(() => {
                        reconnectingRef.current = false;
                        connect();
                    }, reconnectDelayMs);
                }
            };
        } catch {
            setConnected(false);
            setError('Failed to initialize audit feed websocket');
        }
    }, [paused, url, severities, maxEntries, reconnectDelayMs, clearReconnectTimer]);

    useEffect(() => {
        if (!paused) connect();

        return () => {
            clearReconnectTimer();
            closeSocket();
        };
    }, [connect, paused, clearReconnectTimer, closeSocket]);

    const pause = useCallback(() => {
        setPaused(true);
        clearReconnectTimer();
        closeSocket();
        setConnected(false);
    }, [clearReconnectTimer, closeSocket]);

    const resume = useCallback(() => {
        setPaused(false);
    }, []);

    const clear = useCallback(() => {
        setEntries([]);
    }, []);

    return useMemo(
        () => ({
            entries,
            connected,
            paused,
            error,
            clear,
            pause,
            resume,
        }),
        [entries, connected, paused, error, clear, pause, resume],
    );
}

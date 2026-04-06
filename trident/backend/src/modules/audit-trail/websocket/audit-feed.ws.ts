import { URL } from 'url';
import type { IncomingMessage, Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import { WebSocketServer, type WebSocket } from 'ws';
import type { AuditLogEntry, AuditSeverity } from '../types/audit-log.types';
import type { AuditLogService } from '../services/audit-log.service';

interface FeedAuthPayload {
    wallet: string;
    role: string;
}

interface FeedClient {
    wallet: string;
    role: string;
    socket: WebSocket;
    severities: Set<AuditSeverity> | null;
    isAlive: boolean;
}

interface AuditFeedServerConfig {
    path: string;
    jwtSecret: string;
    maxConnectionsPerWallet?: number;
}

export class AuditFeedServer {
    private readonly wss = new WebSocketServer({ noServer: true });
    private readonly clients = new Set<FeedClient>();
    private readonly clientCountByWallet = new Map<string, number>();
    private readonly maxConnectionsPerWallet: number;
    private readonly onEntryUnsubscribe: () => void;
    private heartbeatTimer: NodeJS.Timeout | null = null;

    public constructor(
        private readonly server: HttpServer,
        private readonly service: AuditLogService,
        private readonly config: AuditFeedServerConfig,
    ) {
        this.maxConnectionsPerWallet = config.maxConnectionsPerWallet ?? 3;
        this.onEntryUnsubscribe = this.service.subscribe((entry) => this.broadcast(entry));
        this.server.on('upgrade', this.handleUpgrade);
        this.heartbeatTimer = setInterval(() => this.heartbeat(), 30000);
    }

    public shutdown(): void {
        this.onEntryUnsubscribe();
        this.server.off('upgrade', this.handleUpgrade);
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }

        for (const client of this.clients) {
            client.socket.close(1001, 'Server shutting down');
        }

        this.clients.clear();
        this.clientCountByWallet.clear();
        this.wss.close();
    }

    private readonly handleUpgrade = (request: IncomingMessage, socket: IncomingMessage['socket'], head: Buffer): void => {
        const base = request.headers.host ? `http://${request.headers.host}` : 'http://localhost';
        const url = new URL(request.url ?? '/', base);

        if (url.pathname !== this.config.path) {
            return;
        }

        const tokenFromQuery = url.searchParams.get('token');
        const authHeader = request.headers.authorization;
        const tokenFromHeader = authHeader?.toLowerCase().startsWith('bearer ')
            ? authHeader.slice(7).trim()
            : null;
        const token = tokenFromQuery ?? tokenFromHeader;

        if (!token) {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }

        let payload: FeedAuthPayload;
        try {
            payload = jwt.verify(token, this.config.jwtSecret) as FeedAuthPayload;
        } catch {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
            socket.destroy();
            return;
        }

        const currentCount = this.clientCountByWallet.get(payload.wallet) ?? 0;
        if (currentCount >= this.maxConnectionsPerWallet) {
            socket.write('HTTP/1.1 429 Too Many Requests\r\n\r\n');
            socket.destroy();
            return;
        }

        this.wss.handleUpgrade(request, socket, head, (ws) => {
            const client: FeedClient = {
                wallet: payload.wallet,
                role: payload.role,
                socket: ws,
                severities: null,
                isAlive: true,
            };

            this.clients.add(client);
            this.clientCountByWallet.set(payload.wallet, currentCount + 1);

            ws.on('message', (raw) => {
                this.handleMessage(client, raw.toString());
            });

            ws.on('pong', () => {
                client.isAlive = true;
            });

            ws.on('close', () => {
                this.clients.delete(client);
                const walletCount = this.clientCountByWallet.get(client.wallet) ?? 1;
                if (walletCount <= 1) {
                    this.clientCountByWallet.delete(client.wallet);
                } else {
                    this.clientCountByWallet.set(client.wallet, walletCount - 1);
                }
            });

            ws.send(
                JSON.stringify({
                    type: 'connected',
                    wallet: client.wallet,
                    role: client.role,
                    ts: new Date().toISOString(),
                }),
            );
        });
    };

    private handleMessage(client: FeedClient, message: string): void {
        try {
            const payload = JSON.parse(message) as {
                type?: string;
                severities?: AuditSeverity[];
            };

            if (payload.type === 'subscribe' && Array.isArray(payload.severities)) {
                client.severities = new Set(payload.severities);
                client.socket.send(
                    JSON.stringify({
                        type: 'subscribed',
                        severities: Array.from(client.severities),
                        ts: new Date().toISOString(),
                    }),
                );
            }

            if (payload.type === 'unsubscribe') {
                client.severities = null;
                client.socket.send(JSON.stringify({ type: 'subscribed', severities: null, ts: new Date().toISOString() }));
            }
        } catch {
            client.socket.send(JSON.stringify({ type: 'error', error: 'Invalid message payload' }));
        }
    }

    private heartbeat(): void {
        for (const client of this.clients) {
            if (!client.isAlive) {
                client.socket.terminate();
                continue;
            }
            client.isAlive = false;
            client.socket.ping();
        }
    }

    private broadcast(entry: AuditLogEntry): void {
        const payload = JSON.stringify({
            type: 'audit-entry',
            entry,
            ts: new Date().toISOString(),
        });

        for (const client of this.clients) {
            if (client.severities && !client.severities.has(entry.severity)) {
                continue;
            }
            client.socket.send(payload);
        }
    }
}

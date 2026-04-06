export interface AuditLog {
  id: string;
  action: string;
  actorWallet: string;
  actorRole: string;
  target: string;
  status: 'success' | 'error';
  timestamp: string;
  details: Record<string, unknown>;
}

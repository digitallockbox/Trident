import { useEffect, useState } from "react";
import "./OperatorAuditTrailWidget.css";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const POLL_INTERVAL = 8000;

interface AuditItem {
  id: string;
  action: string;
  actorWallet: string;
  actorRole: string;
  target: string;
  status: "success" | "error";
  timestamp: string;
  details: Record<string, unknown>;
}

interface OperatorAuditTrailWidgetProps {
  actorWallet: string | null;
  actorRole: string | null;
}

export default function OperatorAuditTrailWidget({
  actorWallet,
  actorRole,
}: OperatorAuditTrailWidgetProps) {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const load = () => {
      fetch(`${API}/operator/audit/logs?limit=50`, {
        credentials: "include",
        headers: {
          ...(actorWallet ? { "x-wallet": actorWallet } : {}),
          ...(actorRole ? { "x-role": actorRole } : {}),
        },
      })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json() as Promise<{ ok: boolean; items: AuditItem[] }>;
        })
        .then((data) => {
          setItems(data.items);
          setOffline(false);
        })
        .catch(() => setOffline(true));
    };

    load();
    const timer = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [actorRole, actorWallet]);

  return (
    <div className="operator-audit-widget">
      <h3 className="operator-audit-title">Operator Audit Trail</h3>
      {offline && (
        <p className="operator-audit-offline">Audit feed unavailable.</p>
      )}
      {!offline && items.length === 0 && (
        <p className="operator-audit-empty">
          No operator actions recorded yet.
        </p>
      )}
      {!offline && items.length > 0 && (
        <ul className="operator-audit-list">
          {items.map((item) => (
            <li key={item.id} className="operator-audit-item">
              <div className="operator-audit-row">
                <span className="operator-audit-action">{item.action}</span>
                <span
                  className={`operator-audit-status operator-audit-status--${item.status}`}
                >
                  {item.status}
                </span>
              </div>
              <p className="operator-audit-meta">
                {item.actorWallet} ({item.actorRole}) → {item.target}
              </p>
              <time className="operator-audit-time">
                {new Date(item.timestamp).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

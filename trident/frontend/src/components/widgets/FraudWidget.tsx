import { useEffect, useState, useCallback } from "react";
import "./FraudWidget.css";

interface FraudSignal {
  id: string;
  wallet: string;
  reason: string;
  severity: "low" | "medium" | "high";
  timestamp: number;
}

const POLL_INTERVAL = 10000;
const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface FraudWidgetProps {
  actorWallet: string | null;
  actorRole: string | null;
}

export default function FraudWidget({
  actorWallet,
  actorRole,
}: FraudWidgetProps) {
  const [signals, setSignals] = useState<FraudSignal[]>([]);
  const [error, setError] = useState(false);
  const [dismissing, setDismissing] = useState<string | null>(null);

  useEffect(() => {
    const load = () => {
      fetch(`${import.meta.env.VITE_API_URL}/fraud/signals`, {
        credentials: "include",
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data: FraudSignal[]) => {
          setSignals(data);
          setError(false);
        })
        .catch(() => setError(true));
    };

    load();
    const id = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  const dismiss = useCallback(
    (signalId: string) => {
      setDismissing(signalId);
      fetch(`${API}/operator/fraud/dismiss`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(actorWallet ? { "x-wallet": actorWallet } : {}),
          ...(actorRole ? { "x-role": actorRole } : {}),
        },
        body: JSON.stringify({ id: signalId }),
      })
        .then((r) => {
          if (!r.ok) throw new Error("non-ok");
        })
        .then(() => setSignals((prev) => prev.filter((s) => s.id !== signalId)))
        .catch(() => {
          /* keep signal in list on failure */
        })
        .finally(() => setDismissing(null));
    },
    [actorRole, actorWallet],
  );

  return (
    <div className="fraud-widget">
      <h3 className="fraud-widget-title">Fraud Signals</h3>
      {error && <p className="fraud-widget-offline">Fraud feed unavailable.</p>}
      {!error && signals.length === 0 && (
        <p className="fraud-widget-clear">No active fraud alerts.</p>
      )}
      {!error && signals.length > 0 && (
        <ul className="fraud-widget-list">
          {signals.map((s, i) => (
            <li key={i} className="fraud-signal">
              <div className="fraud-signal-header">
                <span className="fraud-signal-wallet">{s.wallet}</span>
                <span
                  className={`fraud-signal-severity fraud-signal-severity--${s.severity}`}
                >
                  {s.severity}
                </span>
                <button
                  className="fraud-signal-dismiss"
                  onClick={() => dismiss(s.id)}
                  disabled={dismissing !== null}
                >
                  {dismissing === s.id ? "…" : "Dismiss"}
                </button>
              </div>
              <p className="fraud-signal-reason">{s.reason}</p>
              <time className="fraud-signal-time">
                {new Date(s.timestamp * 1000).toLocaleString()}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

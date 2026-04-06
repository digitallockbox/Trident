import { useEffect, useState, useCallback } from "react";
import "./PayoutHistoryWidget.css";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface Payout {
  id: string;
  userId: string;
  amount: number;
  createdAt: string;
}

interface PayoutHistoryWidgetProps {
  actorWallet: string | null;
  actorRole: string | null;
}

export default function PayoutHistoryWidget({
  actorWallet,
  actorRole,
}: PayoutHistoryWidgetProps) {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [offline, setOffline] = useState(false);
  const [replaying, setReplaying] = useState<string | null>(null);
  const [replayResult, setReplayResult] = useState<string | null>(null);
  const [replayError, setReplayError] = useState<string | null>(null);

  const replay = useCallback(
    (payoutId: string) => {
      setReplaying(payoutId);
      setReplayResult(null);
      setReplayError(null);
      fetch(`${API}/operator/payout/replay`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(actorWallet ? { "x-wallet": actorWallet } : {}),
          ...(actorRole ? { "x-role": actorRole } : {}),
        },
        body: JSON.stringify({ payoutId }),
      })
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json() as Promise<{ ok: boolean; result: unknown }>;
        })
        .then((data) => setReplayResult(JSON.stringify(data.result)))
        .catch((e: Error) => setReplayError(e.message))
        .finally(() => setReplaying(null));
    },
    [actorRole, actorWallet],
  );

  useEffect(() => {
    fetch(`${API}/payouts/history`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("non-ok");
        return r.json() as Promise<Payout[]>;
      })
      .then((data) => {
        setPayouts(data);
        setOffline(false);
      })
      .catch(() => setOffline(true));
  }, []);

  return (
    <div className="payout-history-widget">
      <h3 className="payout-history-title">Payout History</h3>
      {offline && (
        <p className="payout-history-offline">
          Offline — could not load payouts.
        </p>
      )}
      {!offline && payouts.length === 0 && (
        <p className="payout-history-empty">No payouts yet.</p>
      )}
      {payouts.length > 0 && (
        <ul className="payout-history-list">
          {payouts.map((p) => (
            <li key={p.id} className="payout-history-item">
              <span className="payout-history-amount">
                {p.amount.toLocaleString()} SOL
              </span>
              <span className="payout-history-time">
                {new Date(p.createdAt).toLocaleString()}
              </span>
              <button
                className="payout-history-replay"
                onClick={() => replay(p.id)}
                disabled={replaying !== null}
              >
                {replaying === p.id ? "…" : "Replay"}
              </button>
            </li>
          ))}
        </ul>
      )}
      {replayResult && (
        <p className="payout-history-replay-result">Replayed: {replayResult}</p>
      )}
      {replayError && (
        <p className="payout-history-replay-error">Error: {replayError}</p>
      )}
    </div>
  );
}

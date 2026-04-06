import { useEffect, useState } from "react";
import { useSession } from "../../state/hooks/useSession";
import { PayoutRequestForm } from "../../components/PayoutRequestForm";

type Payout = {
  id: string;
  amount: number;
  destination: string;
  method: string;
  status: string;
  timestamp: string;
};

export default function PayoutControls() {
  const { wallet } = useSession();
  const [balance, setBalance] = useState<number | null>(null);
  const [history, setHistory] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!wallet) return;
    setLoading(true);
    setError("");
    Promise.all([
      fetch("/conduit/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "balance", party: wallet }),
      }).then((r) => r.json()),
      fetch("/conduit/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "history", party: wallet, limit: 10 }),
      }).then((r) => r.json()),
    ])
      .then(([bal, hist]) => {
        setBalance(bal?.balance?.available ?? 0);
        setHistory(hist?.history || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load payout info.");
        setLoading(false);
      });
  }, [wallet]);

  // Example authHeaders, replace with real auth logic as needed
  const authHeaders = wallet ? { "x-wallet": wallet } : {};

  return (
    <div className="dashboard-card payout-controls">
      <h2>Payout Controls</h2>
      {loading ? (
        <div className="payout-info-placeholder">Loading…</div>
      ) : error ? (
        <div className="payout-info-placeholder">{error}</div>
      ) : (
        <>
          <div className="payout-balance">
            Available: <b>${balance?.toFixed(2)}</b>
          </div>
          <div className="payout-history">
            <h4>Payout History</h4>
            {history.length === 0 ? (
              <div className="payout-info-placeholder">No payouts yet.</div>
            ) : (
              <ul className="payout-history-list">
                {history.map((p) => (
                  <li
                    key={p.id}
                    className={`payout-row payout-status-${p.status}`}
                  >
                    <span>{new Date(p.timestamp).toLocaleDateString()}</span>
                    <span>${p.amount.toFixed(2)}</span>
                    <span>{p.destination}</span>
                    <span>{p.method}</span>
                    <span>{p.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button className="request-payout-btn" onClick={() => setShowModal(true)}>
            Request Payout
          </button>
          {showModal && (
            <div className="modal-overlay" onClick={() => setShowModal(false)}>
              <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={() => setShowModal(false)}>
                  ×
                </button>
                <PayoutRequestForm authHeaders={authHeaders} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

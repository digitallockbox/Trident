import { useEffect, useState } from "react";

type Tx = {
  id: string;
  type: string;
  status: string;
  fee?: number;
  signature?: string;
  submittedAt: string;
};

export default function TransactionFeed() {
  const [txs, setTxs] = useState<Tx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch("/relay/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "history", limit: 25 }),
    })
      .then((r) => r.json())
      .then((data) => {
        setTxs(data.transactions || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load transactions.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="dashboard-card transaction-feed">
      <h2>Transaction Feed</h2>
      {loading ? (
        <div className="transaction-table-placeholder">Loading…</div>
      ) : error ? (
        <div className="transaction-table-placeholder">{error}</div>
      ) : txs.length === 0 ? (
        <div className="transaction-table-placeholder">
          No transactions yet.
        </div>
      ) : (
        <table className="transaction-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Status</th>
              <th>Fee</th>
              <th>Signature</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {txs.map((tx) => (
              <tr key={tx.id} className={`tx-row tx-status-${tx.status}`}>
                <td>{tx.id}</td>
                <td>{tx.type}</td>
                <td>{tx.status}</td>
                <td>{tx.fee ?? "-"}</td>
                <td>{tx.signature ? tx.signature.slice(0, 8) + "…" : "-"}</td>
                <td>{new Date(tx.submittedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

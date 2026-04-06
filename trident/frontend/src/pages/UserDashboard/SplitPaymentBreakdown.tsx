import { useEffect, useState } from "react";

type Split = { party: string; role: string; amount: number };

export default function SplitPaymentBreakdown() {
  const [splits, setSplits] = useState<Split[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetch("/conduit/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ledger", limit: 25 }),
    })
      .then((r) => r.json())
      .then((data) => {
        // Flatten splits from recent events
        const allSplits = (data.events || []).flatMap(
          (e: any) => e.splits || [],
        );
        setSplits(allSplits);
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load split data.");
        setLoading(false);
      });
  }, []);

  // Aggregate by party/role
  const agg: Record<string, number> = {};
  splits.forEach((s) => {
    const key = `${s.party} (${s.role})`;
    agg[key] = (agg[key] || 0) + s.amount;
  });

  const chartData = Object.entries(agg);

  return (
    <div className="dashboard-card split-breakdown">
      <h2>Split-Payment Breakdown</h2>
      {loading ? (
        <div className="split-chart-placeholder">Loading…</div>
      ) : error ? (
        <div className="split-chart-placeholder">{error}</div>
      ) : chartData.length === 0 ? (
        <div className="split-chart-placeholder">No split data.</div>
      ) : (
        <div className="split-chart-bar">
          {chartData.map(([label, value]) => (
            <div key={label} className="split-bar-row">
              <span className="split-bar-label">{label}</span>
              <div className="split-bar-track">
                <div
                  className="split-bar-fill"
                  style={{
                    width: `${Math.max(5, (value / Math.max(...chartData.map(([, v]) => v))) * 100)}%`,
                  }}
                />
                <span className="split-bar-value">${value.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

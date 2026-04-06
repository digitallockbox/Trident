import { useEffect, useState, useRef } from "react";

function useAnimatedNumber(value: number, duration = 600) {
  const [display, setDisplay] = useState(value);
  const raf = useRef<number>();
  useEffect(() => {
    let start: number | null = null;
    const initial = display;
    const diff = value - initial;
    if (Math.abs(diff) < 0.01) return setDisplay(value);
    function animate(ts: number) {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(1, elapsed / duration);
      setDisplay(initial + diff * progress);
      if (progress < 1) raf.current = requestAnimationFrame(animate);
      else setDisplay(value);
    }
    raf.current = requestAnimationFrame(animate);
    return () => raf.current && cancelAnimationFrame(raf.current);
    // eslint-disable-next-line
  }, [value]);
  return display;
}

type Metrics = {
  totalRevenue: number;
  todayRevenue: number;
  pendingPayouts: number;
  completedPayouts: number;
  refunds: number;
  gaslessTx: number;
};

export default function RevenueOverview() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([
      fetch("/relay/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stats" }),
      }).then((r) => r.json()),
      fetch("/conduit/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "stats" }),
      }).then((r) => r.json()),
    ])
      .then(([relay, conduit]) => {
        setMetrics({
          totalRevenue: conduit?.totalRevenue ?? 0,
          todayRevenue: conduit?.todayRevenue ?? 0,
          pendingPayouts: conduit?.pendingPayouts ?? 0,
          completedPayouts: conduit?.completedPayouts ?? 0,
          refunds: conduit?.refunds ?? 0,
          gaslessTx: relay?.confirmed ?? 0,
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Unable to load metrics.");
        setLoading(false);
      });
  }, []);

  // Premium: Large balance card at top, animated
  const balance = useAnimatedNumber(metrics?.totalRevenue ?? 0);

  return (
    <div className="revenue-overview-panel">
      <div className="balance-card">
        <div className="balance-label">Total Balance</div>
        <div className="balance-amount">
          $
          {balance.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      </div>
      <div className="dashboard-card revenue-metrics-panel">
        <h2>Revenue Metrics</h2>
        {loading ? (
          <div className="metrics-row">
            <div className="metric-card">Loading…</div>
          </div>
        ) : error ? (
          <div className="metrics-row">
            <div className="metric-card">{error}</div>
          </div>
        ) : metrics ? (
          <div className="metrics-row">
            <div className="metric-card metric-animate">
              {useAnimatedNumber(metrics.todayRevenue).toLocaleString(
                undefined,
                { minimumFractionDigits: 2 },
              )}
              <br />
              <span>Today</span>
            </div>
            <div className="metric-card metric-animate">
              {useAnimatedNumber(metrics.pendingPayouts).toLocaleString(
                undefined,
                { minimumFractionDigits: 2 },
              )}
              <br />
              <span>Pending Payouts</span>
            </div>
            <div className="metric-card metric-animate">
              {useAnimatedNumber(metrics.completedPayouts).toLocaleString(
                undefined,
                { minimumFractionDigits: 2 },
              )}
              <br />
              <span>Completed Payouts</span>
            </div>
            <div className="metric-card metric-animate">
              {useAnimatedNumber(metrics.refunds).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
              <br />
              <span>Refunds</span>
            </div>
            <div className="metric-card metric-animate">
              {metrics.gaslessTx}
              <br />
              <span>Gasless Tx</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

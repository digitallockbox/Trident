import { useEffect, useState } from "react";
import "./MetricsWidget.css";

interface Metrics {
  slot: number | null;
  payouts: number | null;
}

function parseMetrics(text: string): Metrics {
  const slotMatch = text.match(/solana_current_slot\s+(\d+)/);
  const payoutMatch = text.match(/payouts_total\s+(\d+)/);
  return {
    slot: slotMatch ? Number(slotMatch[1]) : null,
    payouts: payoutMatch ? Number(payoutMatch[1]) : null,
  };
}

const POLL_INTERVAL = 5000;

export default function MetricsWidget() {
  const [metrics, setMetrics] = useState<Metrics>({
    slot: null,
    payouts: null,
  });
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = () => {
      fetch(`${import.meta.env.VITE_API_URL}/metrics`)
        .then((res) => res.text())
        .then((text) => {
          setMetrics(parseMetrics(text));
          setError(false);
        })
        .catch(() => setError(true));
    };

    load();
    const id = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="metrics-widget">
      <h3 className="metrics-widget-title">Live Metrics</h3>
      {error ? (
        <p className="metrics-widget-offline">Metrics unavailable.</p>
      ) : (
        <ul className="metrics-widget-list">
          <li>
            <span className="metrics-widget-label">Current Slot</span>
            <span className="metrics-widget-value">
              {metrics.slot !== null ? metrics.slot.toLocaleString() : "…"}
            </span>
          </li>
          <li>
            <span className="metrics-widget-label">Total Payouts</span>
            <span className="metrics-widget-value">
              {metrics.payouts !== null
                ? metrics.payouts.toLocaleString()
                : "…"}
            </span>
          </li>
        </ul>
      )}
    </div>
  );
}

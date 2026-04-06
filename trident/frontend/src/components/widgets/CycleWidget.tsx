import { useEffect, useRef, useState } from "react";
import "./CycleWidget.css";

interface CycleData {
  start: number;
  end: number;
  progress: number;
}

export default function CycleWidget() {
  const [cycle, setCycle] = useState<CycleData | null>(null);
  const [error, setError] = useState(false);
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/cycle`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setCycle)
      .catch(() => setError(true));
  }, []);

  const pct = cycle
    ? Math.min(100, Math.max(0, Math.round(cycle.progress * 100)))
    : 0;

  useEffect(() => {
    fillRef.current?.style.setProperty("--cycle-pct", `${pct}%`);
  }, [pct]);

  if (error)
    return <p className="cycle-widget-offline">Cycle data unavailable.</p>;
  if (!cycle) return <p className="cycle-widget-loading">Loading cycle…</p>;

  return (
    <div className="cycle-widget">
      <h3 className="cycle-widget-title">Payout Cycle</h3>
      <div className="cycle-widget-row">
        <span className="cycle-widget-label">Progress</span>
        <span className="cycle-widget-value">{pct}%</span>
      </div>
      <div className="cycle-track">
        <div className="cycle-fill" ref={fillRef} />
      </div>
      <div className="cycle-widget-row">
        <span className="cycle-widget-label">Next payout</span>
        <span className="cycle-widget-value">
          {new Date(cycle.end).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

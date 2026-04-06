import { useEffect, useState } from "react";
import "./Dashboard.css";

export default function Dashboard() {
  const [metrics, setMetrics] = useState<string>("");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/metrics`)
      .then((res) => res.text())
      .then(setMetrics)
      .catch(() => setMetrics("Unable to load metrics."));
  }, []);

  return (
    <div className="dashboard-page">
      <h1>System Metrics</h1>
      <pre className="dashboard-pre">{metrics || "Loading…"}</pre>
    </div>
  );
}

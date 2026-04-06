import { useEffect, useState } from "react";
import "./RpcWidget.css";

interface RpcStatus {
  current: string;
  latencyMs: number;
  slot: number;
  failovers: number;
  lastFailover: number | null;
}

const POLL_INTERVAL = 8000;

export default function RpcWidget() {
  const [rpc, setRpc] = useState<RpcStatus | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = () => {
      fetch(`${import.meta.env.VITE_API_URL}/rpc/status`, {
        credentials: "include",
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then((data: RpcStatus) => {
          setRpc(data);
          setError(false);
        })
        .catch(() => setError(true));
    };

    load();
    const id = setInterval(load, POLL_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rpc-widget">
      <h3 className="rpc-widget-title">RPC Status</h3>
      {error && <p className="rpc-widget-offline">RPC status unavailable.</p>}
      {!error && !rpc && <p className="rpc-widget-loading">Loading…</p>}
      {rpc && (
        <ul className="rpc-widget-list">
          <li>
            <span className="rpc-widget-label">Endpoint</span>
            <span className="rpc-widget-value rpc-widget-endpoint">
              {rpc.current}
            </span>
          </li>
          <li>
            <span className="rpc-widget-label">Latency</span>
            <span
              className={`rpc-widget-value ${rpc.latencyMs > 500 ? "rpc-widget-value--warn" : ""}`}
            >
              {rpc.latencyMs} ms
            </span>
          </li>
          <li>
            <span className="rpc-widget-label">Slot</span>
            <span className="rpc-widget-value">
              {rpc.slot.toLocaleString()}
            </span>
          </li>
          <li>
            <span className="rpc-widget-label">Failovers</span>
            <span
              className={`rpc-widget-value ${rpc.failovers > 0 ? "rpc-widget-value--warn" : ""}`}
            >
              {rpc.failovers}
            </span>
          </li>
          <li>
            <span className="rpc-widget-label">Last Failover</span>
            <span className="rpc-widget-value">
              {rpc.lastFailover
                ? new Date(rpc.lastFailover * 1000).toLocaleString()
                : "None"}
            </span>
          </li>
        </ul>
      )}
    </div>
  );
}

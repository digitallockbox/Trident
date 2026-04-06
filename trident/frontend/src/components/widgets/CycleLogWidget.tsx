import { useEffect, useState } from "react";
import "./CycleLogWidget.css";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

interface CycleLogEntry {
  timestamp: number;
  message: string;
  level: "info" | "warn" | "error";
}

export default function CycleLogWidget() {
  const [entries, setEntries] = useState<CycleLogEntry[]>([]);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    fetch(`${API}/cycle/logs`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("non-ok");
        return r.json() as Promise<CycleLogEntry[]>;
      })
      .then((data) => {
        setEntries(data);
        setOffline(false);
      })
      .catch(() => setOffline(true));
  }, []);

  return (
    <div className="cycle-log-widget">
      <h3 className="cycle-log-title">Cycle Logs</h3>
      {offline && (
        <p className="cycle-log-offline">Offline — could not load logs.</p>
      )}
      {!offline && entries.length === 0 && (
        <p className="cycle-log-empty">No log entries.</p>
      )}
      {entries.length > 0 && (
        <ul className="cycle-log-list">
          {entries.map((e, i) => (
            <li
              key={i}
              className={`cycle-log-entry cycle-log-entry--${e.level}`}
            >
              <span className="cycle-log-time">
                {new Date(e.timestamp).toLocaleTimeString()}
              </span>
              <span className="cycle-log-message">{e.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { useMemo, useState } from "react";
import {
  useAuditFeed,
  type AuditFeedEntry,
  type AuditFeedSeverity,
  type UseAuditFeedOptions,
} from "../hooks/useAuditFeed";

export interface AuditFeedPanelProps {
  feedOptions: UseAuditFeedOptions;
  className?: string;
}

const severityOrder: AuditFeedSeverity[] = [
  "emergency",
  "critical",
  "warning",
  "info",
];

const formatTs = (iso: string): string => {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : date.toLocaleString();
};

export function AuditFeedPanel({
  feedOptions,
  className,
}: AuditFeedPanelProps) {
  const [activeSeverities, setActiveSeverities] = useState<
    Set<AuditFeedSeverity>
  >(new Set(severityOrder));
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { entries, connected, paused, error, clear, pause, resume } =
    useAuditFeed(feedOptions);

  const filtered = useMemo(() => {
    return entries.filter((entry) => activeSeverities.has(entry.severity));
  }, [entries, activeSeverities]);

  const toggleSeverity = (severity: AuditFeedSeverity): void => {
    setActiveSeverities((prev) => {
      const next = new Set(prev);
      if (next.has(severity)) {
        next.delete(severity);
      } else {
        next.add(severity);
      }
      return next;
    });
  };

  const groupedCounts = useMemo(() => {
    const base: Record<AuditFeedSeverity, number> = {
      emergency: 0,
      critical: 0,
      warning: 0,
      info: 0,
    };
    for (const item of entries) {
      base[item.severity] += 1;
    }
    return base;
  }, [entries]);

  const rootClassName = className
    ? `audit-feed-panel ${className}`
    : "audit-feed-panel";

  return (
    <section
      className={rootClassName}
      style={{
        border: "1px solid #2d3748",
        borderRadius: 10,
        padding: 12,
        background: "#0f172a",
      }}
    >
      <header
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <strong style={{ color: "#e2e8f0" }}>Audit Feed</strong>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span
            style={{ color: connected ? "#68d391" : "#f6ad55", fontSize: 12 }}
          >
            {connected ? "Live" : paused ? "Paused" : "Reconnecting"}
          </span>
          <button type="button" onClick={paused ? resume : pause}>
            {paused ? "Resume" : "Pause"}
          </button>
          <button type="button" onClick={clear}>
            Clear
          </button>
        </div>
      </header>

      <div
        style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}
      >
        {severityOrder.map((severity) => {
          const active = activeSeverities.has(severity);
          return (
            <button
              key={severity}
              type="button"
              onClick={() => toggleSeverity(severity)}
              style={{
                border: `1px solid ${active ? "#2b6cb0" : "#4a5568"}`,
                background: active ? "#1e3a5f" : "#1f2937",
                color: "#e2e8f0",
                borderRadius: 999,
                padding: "2px 10px",
                fontSize: 12,
                textTransform: "uppercase",
              }}
            >
              {severity} ({groupedCounts[severity]})
            </button>
          );
        })}
      </div>

      {error && (
        <p style={{ color: "#fc8181", margin: "0 0 8px 0", fontSize: 13 }}>
          {error}
        </p>
      )}

      <div
        style={{ maxHeight: 520, overflowY: "auto", display: "grid", gap: 8 }}
      >
        {filtered.length === 0 && (
          <p style={{ color: "#94a3b8", margin: 0, fontSize: 13 }}>
            No entries for current filters.
          </p>
        )}

        {filtered.map((entry) => {
          const expanded = expandedId === entry.id;
          return (
            <FeedRow
              key={entry.id}
              entry={entry}
              expanded={expanded}
              onToggle={() => setExpandedId(expanded ? null : entry.id)}
            />
          );
        })}
      </div>
    </section>
  );
}

interface FeedRowProps {
  entry: AuditFeedEntry;
  expanded: boolean;
  onToggle: () => void;
}

function FeedRow({ entry, expanded, onToggle }: FeedRowProps) {
  return (
    <article
      style={{
        border: "1px solid #334155",
        borderRadius: 8,
        padding: 10,
        background: "#111827",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
          background: "transparent",
          border: "none",
          color: "#e2e8f0",
          textAlign: "left",
          padding: 0,
          cursor: "pointer",
        }}
      >
        <span style={{ fontWeight: 600 }}>{entry.action}</span>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>
          {formatTs(entry.timestamp)}
        </span>
      </button>

      <div
        style={{
          marginTop: 8,
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          fontSize: 12,
        }}
      >
        <span style={{ color: "#90cdf4" }}>{entry.severity}</span>
        <span style={{ color: "#a0aec0" }}>{entry.outcome}</span>
        <span style={{ color: "#a0aec0" }}>{entry.module}</span>
        <span style={{ color: "#a0aec0" }}>{entry.operatorRole}</span>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: 10,
            borderTop: "1px solid #334155",
            paddingTop: 10,
            fontSize: 12,
            color: "#cbd5e1",
          }}
        >
          <p style={{ margin: "0 0 8px 0" }}>{entry.description}</p>
          <p style={{ margin: "0 0 4px 0" }}>Wallet: {entry.operatorWallet}</p>
          <p style={{ margin: "0 0 4px 0" }}>Endpoint: {entry.endpoint}</p>
          <p style={{ margin: 0 }}>Checksum: {entry.checksum}</p>
          <pre
            style={{
              marginTop: 8,
              padding: 8,
              background: "#0b1220",
              borderRadius: 6,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(entry.metadata, null, 2)}
          </pre>
        </div>
      )}
    </article>
  );
}

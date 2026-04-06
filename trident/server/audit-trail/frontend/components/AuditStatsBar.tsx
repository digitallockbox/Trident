import { useEffect, useMemo, useState } from "react";

interface AuditStats {
  last24h: number;
  last7d: number;
  critical24h: number;
  emergency7d: number;
  lastEmergency?: {
    id: string;
    timestamp: string;
    description: string;
  };
}

interface StatsResponse {
  ok: boolean;
  stats: AuditStats;
}

export interface AuditStatsBarProps {
  apiBaseUrl: string;
  token: string;
  pollIntervalMs?: number;
  className?: string;
}

const DEFAULT_POLL_MS = 30000;

export function AuditStatsBar({
  apiBaseUrl,
  token,
  pollIntervalMs = DEFAULT_POLL_MS,
  className,
}: AuditStatsBarProps) {
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let disposed = false;

    const load = async (): Promise<void> => {
      try {
        const response = await fetch(`${apiBaseUrl.replace(/\/$/, "")}/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const payload = (await response.json()) as StatsResponse;
        if (!disposed) {
          setStats(payload.stats);
          setError(null);
        }
      } catch {
        if (!disposed) {
          setError("Failed to fetch audit stats");
        }
      }
    };

    void load();
    const timer = window.setInterval(() => {
      void load();
    }, pollIntervalMs);

    return () => {
      disposed = true;
      window.clearInterval(timer);
    };
  }, [apiBaseUrl, token, pollIntervalMs]);

  const content = useMemo(() => {
    if (error) {
      return <span style={{ color: "#fc8181" }}>{error}</span>;
    }
    if (!stats) {
      return <span style={{ color: "#a0aec0" }}>Loading audit stats...</span>;
    }

    return (
      <>
        <StatChip label="24h" value={stats.last24h} />
        <StatChip label="7d" value={stats.last7d} />
        <StatChip
          label="Critical (24h)"
          value={stats.critical24h}
          tone="warn"
        />
        <StatChip
          label="Emergency (7d)"
          value={stats.emergency7d}
          tone="danger"
        />
        <span style={{ color: "#cbd5e1", fontSize: 12 }}>
          Last emergency:{" "}
          {stats.lastEmergency
            ? new Date(stats.lastEmergency.timestamp).toLocaleString()
            : "none"}
        </span>
      </>
    );
  }, [stats, error]);

  return (
    <section
      className={className}
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10,
        border: "1px solid #334155",
        borderRadius: 10,
        padding: "10px 12px",
        background: "#0f172a",
      }}
    >
      <strong style={{ color: "#e2e8f0" }}>Audit Stats</strong>
      {content}
    </section>
  );
}

interface StatChipProps {
  label: string;
  value: number;
  tone?: "normal" | "warn" | "danger";
}

function StatChip({ label, value, tone = "normal" }: StatChipProps) {
  const color =
    tone === "danger" ? "#fc8181" : tone === "warn" ? "#f6ad55" : "#63b3ed";
  return (
    <span
      style={{
        border: `1px solid ${color}`,
        borderRadius: 999,
        padding: "2px 8px",
        color,
        fontSize: 12,
      }}
    >
      {label}: {value}
    </span>
  );
}

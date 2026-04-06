import { FC, useCallback, useEffect, useState } from "react";
import GlassCard from "../components/ui/GlassCard";
import GradientTitle from "../components/ui/GradientTitle";
import AdminStatCard from "../components/ui/AdminStatCard";
import AdminStatusMessage from "../components/ui/AdminStatusMessage";
import AdminSearchBar from "../components/ui/AdminSearchBar";
import AdminEngineCard from "../components/ui/AdminEngineCard";
import type { EngineStatus } from "../components/ui/AdminEngineCard";
import {
  AdminActionLink,
  AdminActionButton,
} from "../components/ui/AdminActionButton";
import { useSession } from "../state/hooks/useSession";
import "./AdminDashboard.css";

const ENGINES = [
  {
    name: "Aegis",
    path: "/aegis",
    description: "Security & protection",
    icon: "🛡️",
  },
  {
    name: "Apex",
    path: "/apex",
    description: "Peak performance ops",
    icon: "⚡",
  },
  {
    name: "Ascendant",
    path: "/ascendant",
    description: "Elevation protocols",
    icon: "🚀",
  },
  {
    name: "Chronos",
    path: "/chronos",
    description: "Time & scheduling",
    icon: "⏱️",
  },
  {
    name: "Continuum",
    path: "/continuum",
    description: "Persistent state flow",
    icon: "🔄",
  },
  {
    name: "Echelon",
    path: "/echelon",
    description: "Tier management",
    icon: "📊",
  },
  {
    name: "Eternum",
    path: "/eternum",
    description: "Storage & persistence",
    icon: "💾",
  },
  { name: "Fusion", path: "/fusion", description: "Data merging", icon: "🔗" },
  {
    name: "Genesis",
    path: "/genesis",
    description: "Init & bootstrap",
    icon: "🌱",
  },
  {
    name: "Helios",
    path: "/helios",
    description: "Light & rendering",
    icon: "☀️",
  },
  { name: "Helix", path: "/helix", description: "DNA & structure", icon: "🧬" },
  {
    name: "Hyperion",
    path: "/hyperion",
    description: "High-power compute",
    icon: "⚙️",
  },
  {
    name: "Infinity",
    path: "/infinity",
    description: "Unbounded scaling",
    icon: "♾️",
  },
  {
    name: "Lumen",
    path: "/lumen",
    description: "Insight & analytics",
    icon: "💡",
  },
  {
    name: "Monarch",
    path: "/monarch",
    description: "Governance & control",
    icon: "👑",
  },
  {
    name: "Nexus",
    path: "/nexus",
    description: "Core connections",
    icon: "🔮",
  },
  {
    name: "Nexus 2",
    path: "/nexus2",
    description: "Extended connections",
    icon: "🔮",
  },
  { name: "Omega", path: "/omega", description: "Final resolution", icon: "Ω" },
  {
    name: "Oracle",
    path: "/oracle",
    description: "Prediction & foresight",
    icon: "🔍",
  },
  {
    name: "Overmind",
    path: "/overmind",
    description: "AI orchestration",
    icon: "🧠",
  },
  {
    name: "Overwatch",
    path: "/overwatch",
    description: "Monitoring & alerts",
    icon: "👁️",
  },
  {
    name: "Pantheon",
    path: "/pantheon",
    description: "Collective systems",
    icon: "🏛️",
  },
  {
    name: "Paragon",
    path: "/paragon",
    description: "Quality standards",
    icon: "✨",
  },
  { name: "Prime", path: "/prime", description: "Core kernel", icon: "🔑" },
  {
    name: "Sentinel",
    path: "/sentinel",
    description: "Watchdog & defense",
    icon: "🗼",
  },
  {
    name: "Solaris",
    path: "/solaris",
    description: "Energy & power mgmt",
    icon: "🌞",
  },
  {
    name: "Sovereign",
    path: "/sovereign",
    description: "Authority & ownership",
    icon: "🏰",
  },
] as const;

type EngineHealth = {
  name: string;
  status: EngineStatus;
  latency: number | null;
};

const FILTER_OPTIONS = [
  { value: "all", label: "All Engines" },
  { value: "online", label: "Online" },
  { value: "degraded", label: "Degraded" },
  { value: "offline", label: "Offline" },
  { value: "unknown", label: "Unknown" },
];

const AdminDashboard: FC = () => {
  const { role, loading } = useSession();
  const [healthMap, setHealthMap] = useState<Record<string, EngineHealth>>({});
  const [checking, setChecking] = useState(false);
  const [filter, setFilter] = useState<EngineStatus | "all">("all");
  const [search, setSearch] = useState("");

  const checkHealth = useCallback(async () => {
    setChecking(true);
    const results: Record<string, EngineHealth> = {};

    await Promise.allSettled(
      ENGINES.map(async (engine) => {
        const start = performance.now();
        try {
          const res = await fetch(`/api${engine.path}/health`, {
            signal: AbortSignal.timeout(5000),
          });
          const latency = Math.round(performance.now() - start);
          results[engine.name] = {
            name: engine.name,
            status: res.ok ? "online" : "degraded",
            latency,
          };
        } catch {
          results[engine.name] = {
            name: engine.name,
            status: "offline",
            latency: null,
          };
        }
      }),
    );

    setHealthMap(results);
    setChecking(false);
  }, []);

  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  if (loading) return <AdminStatusMessage message="Checking permissions…" />;
  if (role !== "admin" && role !== "founder") {
    return (
      <AdminStatusMessage message="Access denied. Admin or Founder role required." />
    );
  }

  const onlineCount = Object.values(healthMap).filter(
    (h) => h.status === "online",
  ).length;
  const degradedCount = Object.values(healthMap).filter(
    (h) => h.status === "degraded",
  ).length;
  const offlineCount = Object.values(healthMap).filter(
    (h) => h.status === "offline",
  ).length;
  const avgLatency = (() => {
    const vals = Object.values(healthMap)
      .map((h) => h.latency)
      .filter((l): l is number => l !== null);
    return vals.length
      ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
      : 0;
  })();

  const filtered = ENGINES.filter((engine) => {
    const matchesSearch = engine.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const health = healthMap[engine.name];
    const matchesFilter = filter === "all" || health?.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto px-4 py-12 admin-dashboard">
      <GradientTitle text="Admin Dashboard" size="lg" />
      <p className="text-slate-300 mt-4 mb-8">
        Manage engines, system health, and operations across all 27 Trident
        systems.
      </p>

      {/* System Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <AdminStatCard
          value={onlineCount}
          label="Online"
          colorClass="text-emerald-400"
        />
        <AdminStatCard
          value={degradedCount}
          label="Degraded"
          colorClass="text-amber-400"
        />
        <AdminStatCard
          value={offlineCount}
          label="Offline"
          colorClass="text-red-400"
        />
        <AdminStatCard
          value={`${avgLatency}ms`}
          label="Avg Latency"
          colorClass="text-cyan-400"
        />
      </div>

      {/* Controls */}
      <AdminSearchBar
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={(v) => setFilter(v as EngineStatus | "all")}
        filterOptions={FILTER_OPTIONS}
        onRefresh={checkHealth}
        refreshing={checking}
        refreshLabel="Refresh Health"
      />

      {/* Engine Grid */}
      <GlassCard title={`Engines (${filtered.length} of ${ENGINES.length})`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((engine) => {
            const health = healthMap[engine.name];
            const status: EngineStatus = health?.status ?? "unknown";

            return (
              <AdminEngineCard
                key={engine.path}
                name={engine.name}
                path={engine.path}
                description={engine.description}
                icon={engine.icon}
                status={status}
                latency={health?.latency ?? null}
              />
            );
          })}
        </div>
      </GlassCard>

      {/* Quick Actions */}
      <div className="mt-8">
        <GlassCard title="Quick Actions">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <AdminActionLink to="/admin/ascend">Ascend Console</AdminActionLink>
            <AdminActionLink to="/warroom">War Room</AdminActionLink>
            <AdminActionLink to="/dashboard">Dashboard</AdminActionLink>
            <AdminActionButton onClick={checkHealth} disabled={checking}>
              {checking ? "Checking…" : "Re-check All Engines"}
            </AdminActionButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default AdminDashboard;

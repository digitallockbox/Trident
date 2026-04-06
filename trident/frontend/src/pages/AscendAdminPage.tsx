import { FC, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GlassCard from "../components/ui/GlassCard";
import GradientTitle from "../components/ui/GradientTitle";
import AdminStatCard from "../components/ui/AdminStatCard";
import AdminStatusMessage from "../components/ui/AdminStatusMessage";
import {
  AdminActionButton,
  AdminActionLink,
} from "../components/ui/AdminActionButton";
import { useSession } from "../state/hooks/useSession";
import {
  loadAscend,
  toggleAscend,
  resetAscend,
  clearAscend,
} from "../utils/ascendState";
import type { AscendState } from "../utils/ascendState";
import "./AdminDashboard.css";

const AscendAdminPage: FC = () => {
  const { role, loading: sessionLoading } = useSession();
  const [state, setState] = useState<AscendState>({ enabled: false });
  const [loading, setLoading] = useState(true);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<
    { action: string; timestamp: string; result: string }[]
  >([]);

  const logAction = (action: string, result: string) => {
    setLastAction(action);
    setActivityLog((prev) => [
      { action, result, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 49),
    ]);
  };

  useEffect(() => {
    setState(loadAscend());
    setLoading(false);
  }, []);

  if (sessionLoading)
    return <AdminStatusMessage message="Checking permissions…" />;
  if (role !== "admin" && role !== "founder") {
    return (
      <AdminStatusMessage message="Access denied. Admin or Founder role required." />
    );
  }

  const handleToggle = () => {
    const next = toggleAscend();
    setState(next);
    logAction("Toggle", next.enabled ? "Ascend enabled" : "Ascend disabled");
  };

  const handleReset = () => {
    const next = resetAscend();
    setState(next);
    logAction("Reset", "Restored to PRIME defaults");
  };

  const handleClear = () => {
    clearAscend();
    const next = loadAscend();
    setState(next);
    logAction("Clear", "Storage wiped, fell back to defaults");
  };

  return (
    <div className="container mx-auto px-4 py-12 admin-dashboard">
      <div className="flex items-center gap-3 mb-2">
        <Link
          to="/admin"
          className="text-slate-400 hover:text-cyan-400 transition-colors text-sm"
        >
          ← Admin
        </Link>
      </div>
      <GradientTitle text="Ascend Engine" size="lg" />
      <p className="text-slate-300 mt-4 mb-8">
        Operator console for the Ascend subsystem — toggle, reset, and manage
        persistence.
      </p>

      {loading ? (
        <AdminStatusMessage message="Loading Ascend state…" />
      ) : (
        <>
          {/* Status Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <AdminStatCard
              value={state.enabled ? "ENABLED" : "DISABLED"}
              label="Ascend Mode"
              colorClass={state.enabled ? "text-emerald-400" : "text-red-400"}
            />
            <AdminStatCard
              value={state.enabled ? "Active" : "Inactive"}
              label="Overlay Status"
              colorClass={state.enabled ? "text-cyan-400" : "text-slate-400"}
            />
            <AdminStatCard
              value="localStorage"
              label="Storage Backend"
              colorClass="text-slate-300"
            />
          </div>

          {/* Controls */}
          <GlassCard title="Controls">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <AdminActionButton onClick={handleToggle}>
                {state.enabled ? "Disable Ascend" : "Enable Ascend"}
              </AdminActionButton>
              <AdminActionButton onClick={handleReset}>
                Reset to Default
              </AdminActionButton>
              <AdminActionButton onClick={handleClear}>
                Clear Storage
              </AdminActionButton>
            </div>
            {lastAction && (
              <p className="text-xs text-cyan-400 mt-3">
                Last action: {lastAction}
              </p>
            )}
          </GlassCard>

          {/* State Inspector */}
          <div className="mt-8">
            <GlassCard title="State Inspector">
              <pre className="text-sm text-slate-300 bg-slate-900/50 p-4 rounded overflow-auto">
                {JSON.stringify(state, null, 2)}
              </pre>
            </GlassCard>
          </div>

          {/* Activity Log */}
          <div className="mt-8">
            <GlassCard title={`Activity Log (${activityLog.length})`}>
              {activityLog.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No actions recorded yet.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {activityLog.map((entry, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm border-b border-slate-700/30 pb-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-cyan-400 font-mono text-xs">
                          {entry.timestamp}
                        </span>
                        <span className="text-white font-medium">
                          {entry.action}
                        </span>
                      </div>
                      <span className="text-slate-400 text-xs">
                        {entry.result}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Quick Nav */}
          <div className="mt-8">
            <GlassCard title="Navigation">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <AdminActionLink to="/admin">Back to Admin</AdminActionLink>
                <AdminActionLink to="/ascendant">
                  Ascendant Page
                </AdminActionLink>
                <AdminActionLink to="/dashboard">Dashboard</AdminActionLink>
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
};

export default AscendAdminPage;

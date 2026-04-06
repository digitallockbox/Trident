import { FC } from "react";
import { Link } from "react-router-dom";

type EngineStatus = "online" | "degraded" | "offline" | "unknown";

const statusColor: Record<EngineStatus, string> = {
  online: "bg-emerald-500",
  degraded: "bg-amber-500",
  offline: "bg-red-500",
  unknown: "bg-slate-500",
};

const statusLabel: Record<EngineStatus, string> = {
  online: "Online",
  degraded: "Degraded",
  offline: "Offline",
  unknown: "Unknown",
};

interface AdminEngineCardProps {
  name: string;
  path: string;
  description: string;
  icon: string;
  status: EngineStatus;
  latency: number | null;
}

const AdminEngineCard: FC<AdminEngineCardProps> = ({
  name,
  path,
  description,
  icon,
  status,
  latency,
}) => {
  return (
    <Link to={path} className="admin-engine-card group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
            {name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-block w-2 h-2 rounded-full ${statusColor[status]}`}
          />
          <span className="text-xs text-slate-400">{statusLabel[status]}</span>
        </div>
      </div>
      <p className="text-sm text-slate-400">{description}</p>
      {latency !== null && latency !== undefined && (
        <p className="text-xs text-slate-500 mt-1">{latency}ms</p>
      )}
    </Link>
  );
};

export default AdminEngineCard;
export type { EngineStatus };

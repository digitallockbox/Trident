import { FC } from "react";

interface AdminStatCardProps {
  value: string | number;
  label: string;
  colorClass?: string;
}

const AdminStatCard: FC<AdminStatCardProps> = ({
  value,
  label,
  colorClass,
}) => {
  return (
    <div className="admin-stat-card">
      <div className={`admin-stat-value ${colorClass ?? ""}`}>{value}</div>
      <div className="admin-stat-label">{label}</div>
    </div>
  );
};

export default AdminStatCard;

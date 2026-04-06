import { FC } from 'react';

interface MetricBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
}

const MetricBar: FC<MetricBarProps> = ({ label, value, max = 100, color = 'cyan' }) => {
  const percentage = (value / max) * 100;
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm text-slate-300">{label}</span>
        <span className="text-sm font-semibold text-slate-200">{value.toFixed(2)}</span>
      </div>
      <div className="w-full bg-slate-700/30 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r from-${color}-500 to-${color}-400 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default MetricBar;

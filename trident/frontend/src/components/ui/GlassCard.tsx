import { FC } from 'react';

interface GlassCardProps {
  title: string;
  children: React.ReactNode;
}

const GlassCard: FC<GlassCardProps> = ({ title, children }) => {
  return (
    <div className="glass-card p-6 rounded-lg border border-slate-600/30 bg-slate-800/20 backdrop-blur-md">
      <h3 className="text-lg font-semibold text-cyan-400 mb-4">{title}</h3>
      {children}
    </div>
  );
};

export default GlassCard;

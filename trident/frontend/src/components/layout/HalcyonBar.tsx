import { FC } from 'react';

export const HalcyonBar: FC = () => {
  const soothe = () => {
    document.documentElement.style.setProperty('--halcyon-opacity-high', '0.28');
    document.documentElement.style.setProperty('--halcyon-speed', '12s');
  };

  const relax = () => {
    document.documentElement.style.setProperty('--halcyon-opacity-high', '0.16');
    document.documentElement.style.setProperty('--halcyon-speed', '20s');
  };

  return (
    <div className="space-x-3 mt-4 mb-6 text-sm text-slate-300">
      <span className="font-semibold">Halcyon</span>
      <button onClick={soothe} className="px-2 py-1 rounded bg-emerald-500 text-slate-950">
        Soothe
      </button>
      <button onClick={relax} className="px-2 py-1 rounded bg-slate-700 text-white">
        Relax
      </button>
    </div>
  );
};

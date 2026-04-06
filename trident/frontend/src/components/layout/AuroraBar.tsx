import { FC } from 'react';

export const AuroraBar: FC = () => {
  const brighten = () => {
    document.documentElement.style.setProperty('--aurora-opacity-high', '0.45');
    document.documentElement.style.setProperty('--aurora-color-1', '#99ddff');
    document.documentElement.style.setProperty('--aurora-color-2', '#1f6fff');
  };

  const calm = () => {
    document.documentElement.style.setProperty('--aurora-opacity-high', '0.26');
    document.documentElement.style.setProperty('--aurora-color-1', '#58d7ff');
    document.documentElement.style.setProperty('--aurora-color-2', '#1a4eff');
  };

  return (
    <div className="space-x-3 mt-4 mb-6 text-sm text-slate-300">
      <span className="font-semibold">Aurora</span>
      <button onClick={brighten} className="px-2 py-1 rounded bg-cyan-500 text-slate-950">
        Brighten
      </button>
      <button onClick={calm} className="px-2 py-1 rounded bg-slate-700 text-white">
        Calm
      </button>
    </div>
  );
};

import { FC } from 'react';

export const EclipseBar: FC = () => {
  const deepen = () => {
    document.documentElement.style.setProperty('--eclipse-opacity-high', '0.36');
    document.documentElement.style.setProperty('--eclipse-speed', '16s');
  };

  const soften = () => {
    document.documentElement.style.setProperty('--eclipse-opacity-high', '0.16');
    document.documentElement.style.setProperty('--eclipse-speed', '24s');
  };

  return (
    <div className="space-x-3 mt-4 mb-6 text-sm text-slate-300">
      <span className="font-semibold">Eclipse</span>
      <button onClick={deepen} className="px-2 py-1 rounded bg-violet-500 text-slate-950">
        Deepen
      </button>
      <button onClick={soften} className="px-2 py-1 rounded bg-slate-700 text-white">
        Soften
      </button>
    </div>
  );
};

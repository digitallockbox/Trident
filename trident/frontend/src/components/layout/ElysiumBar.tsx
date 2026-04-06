import { ELYSIUM } from "../../utils/elysiumChannel";

export const ElysiumBar = () => {
  const send = (type: string) => {
    ELYSIUM.influenceContinuum({ type });
  };

  return (
    <div className="space-x-3 mt-4 mb-6 text-sm text-slate-300">
      <span className="font-semibold">Elysium</span>
      <button
        onClick={() => send("AMPLIFY")}
        className="px-2 py-1 rounded bg-fuchsia-500 text-slate-950"
      >
        Amplify
      </button>
      <button
        onClick={() => send("QUIET")}
        className="px-2 py-1 rounded bg-slate-700 text-white"
      >
        Quiet
      </button>
      <button
        onClick={() => send("FOCUS")}
        className="px-2 py-1 rounded bg-indigo-500 text-slate-950"
      >
        Focus
      </button>
    </div>
  );
};

import { useEffect, useState } from "react";
import { loadAscend, saveAscend } from "../../utils/ascendState";

export const AscendBar = () => {
  const initial = loadAscend();
  const [enabled, setEnabled] = useState(initial.enabled);

  useEffect(() => {
    const overlay = document.querySelector(".ascend-overlay");
    if (overlay) overlay.classList.toggle("active", enabled);
  }, [enabled]);

  const apply = () => {
    saveAscend({ enabled });
  };

  return (
    <div className="space-x-3 mt-4 mb-6 text-sm text-slate-300">
      <span className="font-semibold">Ascend</span>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
        />
        Enable Ascend Mode
      </label>
      <button onClick={apply} className="px-2 py-1 rounded bg-white/10">
        Apply
      </button>
    </div>
  );
};

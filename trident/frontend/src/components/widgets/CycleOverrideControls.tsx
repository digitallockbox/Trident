import { useState } from "react";
import "./CycleOverrideControls.css";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type OverrideAction = "end_now" | "reset" | "freeze" | "unfreeze";

const ACTIONS: { action: OverrideAction; label: string }[] = [
  { action: "end_now", label: "End Cycle Now" },
  { action: "reset", label: "Reset Cycle" },
  { action: "freeze", label: "Freeze Payouts" },
  { action: "unfreeze", label: "Unfreeze Payouts" },
];

interface CycleOverrideControlsProps {
  actorWallet: string | null;
  actorRole: string | null;
}

export default function CycleOverrideControls({
  actorWallet,
  actorRole,
}: CycleOverrideControlsProps) {
  const [busy, setBusy] = useState<OverrideAction | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const send = (action: OverrideAction) => {
    setBusy(action);
    setLastResult(null);
    setError(null);

    fetch(`${API}/operator/cycle/override`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(actorWallet ? { "x-wallet": actorWallet } : {}),
        ...(actorRole ? { "x-role": actorRole } : {}),
      },
      body: JSON.stringify({ action }),
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<{ ok: boolean; result: unknown }>;
      })
      .then((data) => setLastResult(JSON.stringify(data.result)))
      .catch((e: Error) => setError(e.message))
      .finally(() => setBusy(null));
  };

  return (
    <div className="cycle-override-controls">
      <h3 className="cycle-override-title">Cycle Controls</h3>
      <div className="cycle-override-actions">
        {ACTIONS.map(({ action, label }) => (
          <button
            key={action}
            className="cycle-override-btn"
            onClick={() => send(action)}
            disabled={busy !== null}
          >
            {busy === action ? "…" : label}
          </button>
        ))}
      </div>
      {lastResult && (
        <p className="cycle-override-result">Result: {lastResult}</p>
      )}
      {error && <p className="cycle-override-error">Error: {error}</p>}
    </div>
  );
}

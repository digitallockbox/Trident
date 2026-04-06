import { useState } from "react";
import "./RpcControls.css";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

type RpcTarget = "primary" | "failover";

const TARGETS: { target: RpcTarget; label: string }[] = [
  { target: "primary", label: "Switch to Primary" },
  { target: "failover", label: "Switch to Failover" },
];

interface RpcControlsProps {
  actorWallet: string | null;
  actorRole: string | null;
}

export default function RpcControls({
  actorWallet,
  actorRole,
}: RpcControlsProps) {
  const [busy, setBusy] = useState<RpcTarget | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const switchRpc = (target: RpcTarget) => {
    setBusy(target);
    setLastResult(null);
    setError(null);

    fetch(`${API}/operator/rpc/switch`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(actorWallet ? { "x-wallet": actorWallet } : {}),
        ...(actorRole ? { "x-role": actorRole } : {}),
      },
      body: JSON.stringify({ target }),
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
    <div className="rpc-controls">
      <h3 className="rpc-controls-title">RPC Controls</h3>
      <div className="rpc-controls-actions">
        {TARGETS.map(({ target, label }) => (
          <button
            key={target}
            className="rpc-controls-btn"
            onClick={() => switchRpc(target)}
            disabled={busy !== null}
          >
            {busy === target ? "…" : label}
          </button>
        ))}
      </div>
      {lastResult && (
        <p className="rpc-controls-result">Switched: {lastResult}</p>
      )}
      {error && <p className="rpc-controls-error">Error: {error}</p>}
    </div>
  );
}

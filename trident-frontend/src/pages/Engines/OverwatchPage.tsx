// OverwatchPage.tsx
// Frontend page for interacting with the Overwatch engine

import React, { useState } from "react";
import {
  useOverwatchEngine,
  OverwatchEnginePayload,
} from "../../hooks/engines/useOverwatchEngine";

export default function OverwatchPage() {
  const { execute, loading, result, error } = useOverwatchEngine();
  const [target, setTarget] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: OverwatchEnginePayload = { target };
    execute(payload);
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 32 }}>
      <h1>Overwatch Engine</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Target:</label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="Enter target for Overwatch engine"
            style={{ width: "100%" }}
          />
        </div>
        <button type="submit" disabled={loading} style={{ marginTop: 24 }}>
          {loading ? "Processing..." : "Run Engine"}
        </button>
      </form>
      {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}
      {result && result.status === "success" && (
        <div style={{ marginTop: 16 }}>
          <strong>Result:</strong> {JSON.stringify(result.result)}
        </div>
      )}
    </div>
  );
}

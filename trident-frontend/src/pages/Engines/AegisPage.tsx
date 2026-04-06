// AegisPage.tsx
// Frontend page for interacting with the Aegis engine

import React, { useState } from "react";
import {
  useAegisEngine,
  AegisEnginePayload,
} from "../../hooks/engines/useAegisEngine";

export default function AegisPage() {
  const { execute, loading, result, error } = useAegisEngine();
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: AegisEnginePayload = { input };
    execute(payload);
  };

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: 32 }}>
      <h1>Aegis Engine</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Input:</label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter input for Aegis engine"
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

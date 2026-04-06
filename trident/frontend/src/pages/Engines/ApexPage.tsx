import React, { useState } from "react";
import { useApexEngine } from "../../hooks/engines/useApexEngine";
export default function ApexPage() {
  const { execute, result, loading, error } = useApexEngine();
  const [payload, setPayload] = useState('{\n  "action": "status"\n}');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await execute(JSON.parse(payload));
  };
  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <h2>Apex Engine</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <label>
          Payload (JSON):
          <textarea
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            rows={4}
            required
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Running..." : "Run Engine"}
        </button>
      </form>
      {error && (
        <div style={{ color: "red", marginTop: 16 }}>
          Error: {String(error)}
        </div>
      )}
      {result && (
        <div style={{ marginTop: 16 }}>
          <strong>Result:</strong>
          <pre style={{ background: "#f6f8fa", padding: 12, borderRadius: 4 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

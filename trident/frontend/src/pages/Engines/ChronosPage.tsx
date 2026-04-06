import React, { useState } from "react";
import { useChronos } from "../../hooks/engines/useChronos";

export default function ChronosPage() {
  const { execute, result, loading, error } = useChronos();
  const [action, setAction] = useState("status");
  const [payload, setPayload] = useState('{\n  "action": "status"\n}');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await execute(JSON.parse(payload));
  };

  return (
    <div style={{ padding: 24, maxWidth: 600 }}>
      <h2>Chronos Engine</h2>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <label>
          Action:
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPayload(JSON.stringify({ action: e.target.value }, null, 2));
            }}
          >
            <option value="status">Status</option>
            <option value="history">History</option>
            <option value="sync">Sync</option>
          </select>
        </label>
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

import { useState } from "react";
import { engineRegistry } from "../../engineRegistry";
import styles from "./OmegaPage.module.css";

// Types matching backend
export interface OmegaPayload {
  input: any;
  metadata?: Record<string, any>;
}

export interface OmegaResult {
  ok: boolean;
  message: string;
  data: any;
}

// API client for Omega
async function runOmegaEngine(payload: OmegaPayload): Promise<OmegaResult> {
  const res = await fetch("/api/engines/omega/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error?.error ?? "Omega engine failed");
  }
  return res.json();
}

export default function OmegaPage() {
  const engine = engineRegistry.omega;

  // Default payload for developer testing
  const [payloadText, setPayloadText] = useState(
    JSON.stringify(
      {
        input: { example: "value" },
        metadata: { user: "demo" },
      },
      null,
      2,
    ),
  );
  const [result, setResult] = useState<OmegaResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    let payload: OmegaPayload;
    try {
      payload = JSON.parse(payloadText);
    } catch {
      setError("Payload must be valid JSON.");
      setLoading(false);
      return;
    }
    try {
      const res = await runOmegaEngine(payload);
      setResult(res);
    } catch (err: any) {
      setError(err?.message ?? "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>{engine?.name ?? "Omega Engine"}</h1>
      <p>
        {engine?.description ?? "Run the Omega engine with a custom payload."}
      </p>

      <label className={styles.label}>
        <strong>Payload (JSON)</strong>
        <textarea
          className={styles.textarea}
          value={payloadText}
          onChange={(e) => setPayloadText(e.target.value)}
          rows={10}
        />
      </label>

      <button className={styles.button} onClick={handleRun} disabled={loading}>
        {loading ? "Executing…" : "Run Omega Engine"}
      </button>

      {error && (
        <p className={styles.error}>
          <strong>Error:</strong> {error}
        </p>
      )}

      {result && (
        <pre className={styles.result}>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}

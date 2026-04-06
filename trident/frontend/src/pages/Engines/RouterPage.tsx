import { useState } from "react";
import { engineRegistry } from "../../engineRegistry";
import { runRouterEngine } from "../../api/router";
import type { RouterPayload, RouterResult } from "../../types/router";
import styles from "./RouterPage.module.css";

export default function RouterPage() {
  const engine = engineRegistry.router;
  const [payloadText, setPayloadText] = useState(
    JSON.stringify({ test: true }, null, 2),
  );
  const [result, setResult] = useState<RouterResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    let payload: RouterPayload;
    try {
      payload = JSON.parse(payloadText);
    } catch {
      setError("Payload must be valid JSON.");
      setLoading(false);
      return;
    }
    try {
      const res = await runRouterEngine(payload);
      setResult(res);
    } catch (err: any) {
      setError(err?.message ?? "Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!engine) return <div>Engine not found.</div>;

  return (
    <div className={styles.container}>
      <h1>{engine.name ?? "Router Engine"}</h1>
      <p>
        {engine.description ?? "Run the Router engine with a custom payload."}
      </p>
      <label className={styles.label}>
        <strong>Payload (JSON)</strong>
        <textarea
          className={styles.textarea}
          value={payloadText}
          onChange={(e) => setPayloadText(e.target.value)}
          rows={8}
        />
      </label>
      <button className={styles.button} onClick={execute} disabled={loading}>
        {loading ? "Executing…" : "Run Router Engine"}
      </button>
      {error && (
        <p className={styles.error}>
          <strong>Error:</strong> {error}
        </p>
      )}
      {result && (
        <div className={styles.result}>
          <strong>Result:</strong>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

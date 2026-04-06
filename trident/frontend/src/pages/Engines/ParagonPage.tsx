import { useState } from 'react';
import { getEngine } from '../../engineRegistry';
import { runParagonEngine } from '../../api/paragon';

export default function ParagonPage() {
  const engine = getEngine('paragon');
  const [payloadText, setPayloadText] = useState(
    JSON.stringify({ action: 'schemas' }, null, 2)
  );
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const execute = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    let payload: any;
    try {
      payload = JSON.parse(payloadText);
    } catch {
      setError('Payload must be valid JSON.');
      setLoading(false);
      return;
    }
    try {
      const res = await runParagonEngine(payload);
      setResult(res);
    } catch (err: any) {
      setError(err?.message ?? 'Unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  import { useState } from "react";
  import { engineRegistry } from "../../engineRegistry";
  import { runParagonEngine } from "../../api/paragon";
  import type { ParagonPayload, ParagonResult } from "../../types/paragon";
  import styles from "./ParagonPage.module.css";

  export default function ParagonPage() {
    const engine = engineRegistry.paragon;
    const [payloadText, setPayloadText] = useState(
      JSON.stringify({ action: "schemas" }, null, 2)
    );
    const [result, setResult] = useState<ParagonResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const execute = async () => {
      setLoading(true);
      setError(null);
      setResult(null);
      let payload: ParagonPayload;
      try {
        payload = JSON.parse(payloadText);
      } catch {
        setError("Payload must be valid JSON.");
        setLoading(false);
        return;
      }
      try {
        const res = await runParagonEngine(payload);
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
        <h1>{engine.name ?? "Paragon Engine"}</h1>
        <p>{engine.description ?? "Run the Paragon engine with a custom payload."}</p>
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
          {loading ? "Executing…" : "Run Paragon Engine"}
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
          <pre style={{ background: "#f6f8fa", padding: 12, borderRadius: 4 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

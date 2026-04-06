import React, { useState } from "react";
import { useAegisEngine } from "../../hooks/engines/useAegisEngine";
import styles from "./AegisPage.module.css";

export default function AegisPage() {
  const { execute, result, loading, error } = useAegisEngine();
  const [payload, setPayload] = useState('{\n  "action": "status"\n}');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await execute(JSON.parse(payload));
    } catch (err) {
      // Optionally handle JSON parse errors here
    }
  };

  return (
    <div className={styles.container}>
      <h2>Aegis Engine</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label className={styles.label}>
          Payload (JSON):
          <textarea
            className={styles.textarea}
            value={payload}
            onChange={(e) => setPayload(e.target.value)}
            rows={4}
            required
          />
        </label>
        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? "Running..." : "Run Engine"}
        </button>
      </form>
      {error && <div className={styles.error}>Error: {String(error)}</div>}
      {result && (
        <div className={styles.result}>
          <strong>Result:</strong>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { engineRegistry } from "../../engineRegistry";
import { runOverwatchEngine } from "../../api/overwatch";
import type { OverwatchPayload, OverwatchResult } from "../../types/overwatch";
import styles from "./OverwatchPage.module.css";

export default function OverwatchPage() {
  import { useState } from 'react';
  import { getEngine } from '../../engineRegistry';
  import { runOverwatchEngine } from '../../api/overwatch';
  import type { OverwatchPayload, OverwatchResult } from '../../types/overwatch';

  export default function OverwatchPage() {
    const engine = getEngine('overwatch');

    const [payloadText, setPayloadText] = useState(
      JSON.stringify(
        {
          action: 'status',
          meta: { source: 'ui' }
        },
        null,
        2
      )
    );

    const [result, setResult] = useState<OverwatchResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const execute = async () => {
      setLoading(true);
      setError(null);
      setResult(null);

      let payload: OverwatchPayload;

      try {
        payload = JSON.parse(payloadText);
      } catch {
        setError('Payload must be valid JSON.');
        setLoading(false);
        return;
      }

      try {
        const res = await runOverwatchEngine(payload);
        setResult(res);
      } catch (err: any) {
        setError(err?.message ?? 'Unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    if (!engine) {
      return <div>Engine not found.</div>;
    }

    return (
      <div style={{ padding: '1.5rem', maxWidth: 800, margin: '0 auto' }}>
        <h1>{engine.name}</h1>
        <p>{engine.description}</p>

        <label style={{ display: 'block', marginTop: '1rem' }}>
          <strong>Payload (JSON)</strong>
          <textarea
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            rows={10}
            style={{
              width: '100%',
              marginTop: '0.5rem',
              fontFamily: 'monospace',
              padding: '0.75rem',
              borderRadius: 6,
              border: '1px solid #ccc'
            }}
          />
        </label>

        <button
          onClick={execute}
          disabled={loading}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.25rem',
            borderRadius: 6,
            background: loading ? '#999' : '#007bff',
            color: '#fff',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Executing…' : 'Run Overwatch Engine'}
        </button>

        {error && (
          <p style={{ color: 'red', marginTop: '1rem' }}>
            <strong>Error:</strong> {error}
          </p>
        )}

        {result && (
          <pre
            style={{
              marginTop: '1.5rem',
              background: '#f7f7f7',
              padding: '1rem',
              borderRadius: 6,
              overflowX: 'auto'
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    );
  }

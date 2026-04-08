"use client";

import { useState } from "react";

export default function ApiTestPage() {
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testEndpoint = async (endpoint: string) => {
    setResponse(null);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
      }

      const data = await res.json();
      setResponse(data);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "sans-serif" }}>
      <h1>Trident API Test Harness</h1>
      <p>Test the sandbox connections to the local backend.</p>

      <div style={{ display: "flex", gap: "10px", margin: "20px 0" }}>
        <button
          onClick={() => testEndpoint("/engine/omega")}
          style={{ padding: "10px", background: "#333", color: "white", borderRadius: "5px", cursor: "pointer" }}
        >
          Test Omega
        </button>
        <button
          onClick={() => testEndpoint("/engine/aegis")}
          style={{ padding: "10px", background: "#333", color: "white", borderRadius: "5px", cursor: "pointer" }}
        >
          Test Aegis
        </button>
        <button
          onClick={() => testEndpoint("/engine/overwatch")}
          style={{ padding: "10px", background: "#333", color: "white", borderRadius: "5px", cursor: "pointer" }}
        >
          Test Overwatch
        </button>
      </div>

      <div style={{ marginTop: "30px", background: "#f4f4f4", padding: "20px", borderRadius: "5px", minHeight: "150px" }}>
        <h3>Response:</h3>
        {error && <p style={{ color: "red" }}>Error: {error}</p>}
        {response ? (
          <pre>{JSON.stringify(response, null, 2)}</pre>
        ) : (
          !error && <p style={{ color: "#888" }}>Awaiting request...</p>
        )}
      </div>
    </div>
  );
}

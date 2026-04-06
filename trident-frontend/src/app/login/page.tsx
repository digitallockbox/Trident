"use client";

import { useState } from "react";
import { api } from "../../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);

  const handleLogin = async () => {
    const res = await api.post("/api/auth/login", { email });
    setResult(res);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Login</h1>

      <input
        placeholder="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: 10, marginRight: 10 }}
      />

      <button onClick={handleLogin}>Login</button>

      {result && (
        <pre style={{ marginTop: 20 }}>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}

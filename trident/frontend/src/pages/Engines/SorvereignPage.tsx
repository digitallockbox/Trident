import React from "react";
import { useSorvereignEngine } from "../../hooks/engines/useSorvereignEngine";

export default function SorvereignPage() {
  const { execute } = useSorvereignEngine();

  const run = async () => {
    const result = await execute({ test: true });
    console.log(result);
    // Optionally, set state to display result in UI
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Sorvereign Engine</h2>
      <button onClick={run}>Run Engine</button>
    </div>
  );
}

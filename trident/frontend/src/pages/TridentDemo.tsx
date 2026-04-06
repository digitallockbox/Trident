// Trident Frontend Integration Example
// Place in: frontend/src/pages/TridentDemo.tsx

import React, { useState } from "react";
import { buildSplitInstruction, fetchGlobalConfig } from "../logic/trident-sdk";
import { SplitInstruction, GlobalConfig } from "../types/trident-sdk";

const TridentDemo: React.FC = () => {
  const [config, setConfig] = useState<GlobalConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchConfig = async () => {
    setLoading(true);
    setError(null);
    const response = await fetchGlobalConfig();
    if (response.success && response.data) {
      setConfig(response.data);
    } else {
      setError(response.error || "Unknown error");
    }
    setLoading(false);
  };

  const handleBuildInstruction = () => {
    const ix: SplitInstruction = {
      amount: 1000000,
      creator: "CREATOR_PUBKEY",
      platform: "PLATFORM_PUBKEY",
      mint: "MINT_ADDRESS",
    };
    const instruction = buildSplitInstruction(ix);
    alert("Instruction built: " + instruction.toString());
  };

  return (
    <div>
      <h2>Trident SDK Demo</h2>
      <button onClick={handleFetchConfig} disabled={loading}>
        Fetch Global Config
      </button>
      {config && <pre>{JSON.stringify(config, null, 2)}</pre>}
      {error && <div style={{ color: "red" }}>{error}</div>}
      <button onClick={handleBuildInstruction}>Build Split Instruction</button>
    </div>
  );
};

export default TridentDemo;

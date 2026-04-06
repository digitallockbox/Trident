// EarningsDashboard.tsx — UI for viewing creator earnings
// Place in: frontend/src/components/EarningsDashboard.tsx

import React, { useState } from "react";
import { fetchCreatorEarnings } from "../logic/trident-sdk";
import { CreatorEarnings } from "../types/trident-sdk";

const EarningsDashboard: React.FC = () => {
  const [creator, setCreator] = useState("");
  const [earnings, setEarnings] = useState<CreatorEarnings | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!creator) {
      setStatus("Enter creator pubkey.");
      return;
    }
    setStatus("Loading...");
    const response = await fetchCreatorEarnings(creator);
    if (response.success && response.data) {
      setEarnings(response.data);
      setStatus(null);
    } else {
      setStatus(response.error || "Error fetching earnings.");
    }
  };

  return (
    <div
      style={{
        border: "1px solid #eee",
        padding: 16,
        borderRadius: 8,
        maxWidth: 400,
      }}
    >
      <h3>Creator Earnings Dashboard</h3>
      <input
        type="text"
        placeholder="Creator pubkey"
        value={creator}
        onChange={(e) => setCreator(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <button onClick={handleFetch} style={{ width: "100%" }}>
        Fetch Earnings
      </button>
      {status && <div style={{ marginTop: 8 }}>{status}</div>}
      {earnings && (
        <div style={{ marginTop: 8 }}>
          <div>
            <b>Total Earnings:</b> {earnings.totalEarnings}
          </div>
          <div>
            <b>Splits:</b> {earnings.splits}
          </div>
          <div>
            <b>Last Payout:</b> {earnings.lastPayout}
          </div>
        </div>
      )}
    </div>
  );
};

export default EarningsDashboard;

// AffiliateStatsDashboard.tsx — UI for viewing affiliate stats
// Place in: frontend/src/components/AffiliateStatsDashboard.tsx

import React, { useState } from "react";
import { fetchAffiliateStats } from "../logic/trident-sdk";
import { AffiliateStats } from "../types/trident-sdk";
import "./AffiliateStatsDashboard.css";

const AffiliateStatsDashboard: React.FC = () => {
  const [affiliate, setAffiliate] = useState("");
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleFetch = async () => {
    if (!affiliate) {
      setStatus("Enter affiliate pubkey.");
      return;
    }
    setStatus("Loading...");
    const response = await fetchAffiliateStats(affiliate);
    if (response.success && response.data) {
      setStats(response.data);
      setStatus(null);
    } else {
      setStatus(response.error || "Error fetching stats.");
    }
  };

  return (
    <div className="affiliate-stats-dashboard">
      <h3>Affiliate Stats Dashboard</h3>
      <input
        type="text"
        placeholder="Affiliate pubkey"
        value={affiliate}
        onChange={(e) => setAffiliate(e.target.value)}
        className="affiliate-stats-input"
      />
      <button onClick={handleFetch} className="affiliate-stats-fetch-btn">
        Fetch Stats
      </button>
      {status && <div className="affiliate-stats-status">{status}</div>}
      {stats && (
        <div className="affiliate-stats-results">
          <div>
            <b>Total Earnings:</b> {stats.totalEarnings}
          </div>
          <div>
            <b>Conversions:</b> {stats.conversions}
          </div>
          <div>
            <b>Referred Users:</b> {stats.referredUsers}
          </div>
        </div>
      )}
    </div>
  );
};

export default AffiliateStatsDashboard;

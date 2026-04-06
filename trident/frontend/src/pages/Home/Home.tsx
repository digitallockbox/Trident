import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type ProfileResponse = {
  wallet: string;
  tier: string;
};

export default function Home() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/profile`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch(() => setProfile(null));
  }, []);

  return (
    <div className="home-container">
      <div className="home-hero">
        <h1 className="home-title">TRIDENT</h1>

        <p className="home-subtitle">
          A sovereign-grade streaming engine built for creators, founders, and
          operators. Modular. Deterministic. Infinitely extensible.
        </p>

        <div className="home-actions">
          <Link to="/dashboard" className="home-btn primary">
            Enter Dashboard
          </Link>

          <Link to="/profile" className="home-btn secondary">
            View Profile
          </Link>
        </div>

        <div className="home-note">
          <span className="home-note-eyebrow">System Status</span>
          <h2 className="home-note-title">Backend Connection</h2>

          {!profile && (
            <p className="home-note-warning">
              Unable to reach backend. Check server or API URL.
            </p>
          )}

          {profile && (
            <p className="home-note-copy">
              Connected as <strong>{profile.wallet}</strong> — Tier{" "}
              <strong>{profile.tier}</strong>.
            </p>
          )}
        </div>

        <div className="home-grid">
          <div className="home-card">
            <h3>Real‑Time Metrics</h3>
            <p>Monitor RPC health, payouts, fraud engine, and system load.</p>
          </div>

          <div className="home-card">
            <h3>Creator Engine</h3>
            <p>Deterministic payout cycles with sovereign-grade control.</p>
          </div>

          <div className="home-card">
            <h3>Fraud Protection</h3>
            <p>Advanced detection and cycle validation built into the core.</p>
          </div>

          <div className="home-card">
            <h3>Admin Console</h3>
            <p>Full operational oversight for founders and operators.</p>
          </div>
        </div>
      </div>

      <div className="home-grid">
        <div className="home-card">
          <h3>Deterministic Engine</h3>
          <p>SEC-113 generates your proof-of-cycle vector.</p>
        </div>

        <div className="home-card">
          <h3>Sovereign Sync</h3>
          <p>Local engine output validated before any payout.</p>
        </div>

        <div className="home-card">
          <h3>$STREAMING Rewards</h3>
          <p>Claim tokens secured on the Solana ledger.</p>
        </div>

        <div className="home-card">
          <h3>Creator Economy</h3>
          <p>Your actions generate real value inside the Lab.</p>
        </div>
      </div>
    </div>
  );
}

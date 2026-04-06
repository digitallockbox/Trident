import { useEffect, useState } from "react";
import { UserProfile } from "@shared/types";
import { apiClient, API_ROUTES } from "../utils/apiClient";
import TierBadge from "../components/ui/TierBadge";
import ClaimButton from "../components/widgets/ClaimButton";
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    apiClient
      .getJson<UserProfile>(API_ROUTES.profile)
      .then(setUser)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Unknown error"),
      );
  }, []);

  return (
    <main className="profile-page">
      <h1 className="profile-title">Profile</h1>
      {error ? <p>Profile error: {error}</p> : null}
      {!error && user === null ? <p>Loading profile...</p> : null}
      {user !== null ? (
        <>
          <div className="profile-meta">
            <p>
              <strong>Wallet:</strong> {user.wallet}
            </p>
            <p>
              <strong>Tier:</strong> <TierBadge tier={user.tier} />
            </p>
          </div>
          <div className="profile-actions">
            <ClaimButton />
          </div>
          <pre className="profile-payload">{JSON.stringify(user, null, 2)}</pre>
        </>
      ) : null}
    </main>
  );
}

// ProfileEdit.tsx — UI for editing user profile and role
import React, { useState } from "react";
import { useUser } from "../state/userContext";
import { apiPut } from "../logic/trident-sdk";

const ProfileEdit: React.FC = () => {
  const { profile, setProfile } = useUser();
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [role, setRole] = useState(profile?.role || "user");
  const [status, setStatus] = useState<string | null>(null);

  if (!profile) return <div>Please connect your wallet.</div>;

  const handleSave = async () => {
    setStatus("Saving...");
    const res = await apiPut(`/api/user/${profile.pubkey}`, {
      display_name: displayName,
      avatar_url: avatarUrl,
      role,
    });
    if (res.success && res.data) {
      setProfile(res.data);
      setStatus("Profile updated!");
    } else {
      setStatus("Error: " + (res.error || "Unknown error"));
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
      <h3>Edit Profile</h3>
      <input
        type="text"
        placeholder="Display Name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="text"
        placeholder="Avatar URL"
        value={avatarUrl}
        onChange={(e) => setAvatarUrl(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as any)}
        style={{ width: "100%", marginBottom: 8 }}
      >
        <option value="user">User</option>
        <option value="creator">Creator</option>
        <option value="affiliate">Affiliate</option>
      </select>
      <button onClick={handleSave} style={{ width: "100%" }}>
        Save
      </button>
      {status && <div style={{ marginTop: 8 }}>{status}</div>}
    </div>
  );
};

export default ProfileEdit;

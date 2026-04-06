// Profile UI component
import React from "react";
import { useUser } from "../state/userContext";

const Profile: React.FC = () => {
  const { profile } = useUser();
  if (!profile) return <div>Please connect your wallet.</div>;
  return (
    <div
      style={{
        border: "1px solid #eee",
        padding: 16,
        borderRadius: 8,
        maxWidth: 400,
      }}
    >
      <h3>User Profile</h3>
      <div>
        <b>Public Key:</b> {profile.pubkey}
      </div>
      <div>
        <b>Role:</b> {profile.role}
      </div>
      <div>
        <b>Display Name:</b> {profile.display_name || "N/A"}
      </div>
      <div>
        <b>Avatar:</b>{" "}
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt="avatar" width={40} />
        ) : (
          "N/A"
        )}
      </div>
    </div>
  );
};

export default Profile;

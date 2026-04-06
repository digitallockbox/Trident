// AdminPanel.tsx — Frontend admin dashboard
import React, { useEffect, useState } from "react";
import { useUser } from "../state/userContext";
import { apiGet, apiDelete } from "../logic/trident-sdk";

const AdminPanel: React.FC = () => {
  const { profile } = useUser();
  const [users, setUsers] = useState<any[]>([]);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (profile?.role === "admin") {
      apiGet("/api/users").then((res) => {
        if (res.success && res.data) setUsers(res.data);
      });
    }
  }, [profile]);

  const handleDelete = async (pubkey: string) => {
    setStatus("Deleting...");
    const res = await apiDelete(`/api/user/${pubkey}`);
    if (res.success) {
      setUsers(users.filter((u) => u.pubkey !== pubkey));
      setStatus("User deleted.");
    } else {
      setStatus("Error: " + (res.error || "Unknown error"));
    }
  };

  if (profile?.role !== "admin") return <div>Admins only.</div>;

  return (
    <div
      style={{
        border: "1px solid #eee",
        padding: 16,
        borderRadius: 8,
        maxWidth: 600,
      }}
    >
      <h3>Admin Panel</h3>
      <table style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Pubkey</th>
            <th>Role</th>
            <th>Display Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.pubkey}>
              <td>{u.pubkey}</td>
              <td>{u.role}</td>
              <td>{u.display_name}</td>
              <td>
                <button onClick={() => handleDelete(u.pubkey)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {status && <div style={{ marginTop: 8 }}>{status}</div>}
    </div>
  );
};

export default AdminPanel;

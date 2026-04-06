"use client";

import useSWR from "swr";
import { api } from "../../lib/api";

export default function SystemPage() {
  const { data: info } = useSWR("/api/system/info", api.get);
  const { data: status } = useSWR("/api/system/status", api.get);
  const { data: engines } = useSWR("/api/engines", api.get);

  return (
    <div style={{ padding: 20 }}>
      <h1>System Overview</h1>

      <h2>Info</h2>
      <pre>{JSON.stringify(info, null, 2)}</pre>

      <h2>Status</h2>
      <pre>{JSON.stringify(status, null, 2)}</pre>

      <h2>Engines</h2>
      <div>Engine count: {engines?.length ?? 0}</div>
      <div>Active engines: {engines?.filter((e) => e.active).length ?? 0}</div>
      <pre>{JSON.stringify(engines, null, 2)}</pre>
    </div>
  );
}

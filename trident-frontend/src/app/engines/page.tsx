"use client";

import useSWR from "swr";
import { api } from "../../lib/api";

export default function EnginesPage() {
  const { data } = useSWR("/api/engines", api.get);

  return (
    <div style={{ padding: 20 }}>
      <h1>Engines</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

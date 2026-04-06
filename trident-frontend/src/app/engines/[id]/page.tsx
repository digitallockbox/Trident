"use client";

import useSWR from "swr";
import { api } from "../../../lib/api";

export default function EngineDetail({ params }) {
  const { id } = params;
  const { data } = useSWR(`/api/engines/${id}`, api.get);

  return (
    <div style={{ padding: 20 }}>
      <h1>Engine: {id}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

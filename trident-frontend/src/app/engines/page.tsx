"use client";

import useSWR from "swr";
import { api } from "../../lib/api";
import Link from "next/link";

export default function EnginesPage() {
  const { data } = useSWR("/api/engines", api.get);

  return (
    <div style={{ padding: 20 }}>
      <h1>Engines</h1>
      {data?.map((engine) => (
        <div key={engine.id}>
          <Link href={`/engines/${engine.id}`}>
            {engine.name} ({engine.id})
          </Link>
        </div>
      ))}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

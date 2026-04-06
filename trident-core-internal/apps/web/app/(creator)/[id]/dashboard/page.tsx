"use client";
import { useEffect, useState } from "react";

export default function CreatorDashboard({ params }) {
  const [stream, setStream] = useState(null);

  useEffect(() => {
    fetch(`/api/streams?creatorId=${params.id}`)
      .then((res) => res.json())
      .then(setStream);
  }, [params.id]);

  if (!stream) return <div>Loading...</div>;

  return (
    <div>
      <h1>Live Dashboard</h1>
      <p>Status: {stream.status}</p>
      <p>Title: {stream.title}</p>
      {stream.status === "live" && (
        <>
          <video
            src={stream.playbackUrl}
            controls
            autoPlay
            style={{ width: "100%", borderRadius: 8 }}
          />
          <button
            onClick={async () => {
              await fetch(`/api/streams/${stream.id}/end`, { method: "POST" });
              window.location.reload();
            }}
          >
            End Stream
          </button>
        </>
      )}
      {stream.status === "ended" && <div>Stream ended.</div>}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import Chat from "./Chat";
import styles from "./Chat.module.css";

export default function WatchPage({ params }) {
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/streams/${params.streamId}`,
        { cache: "no-store" },
      );
      setStream(await res.json());
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [params.streamId]);

  if (!stream) return <div>Loading...</div>;
  if (stream.status !== "live") return <div>This stream is offline.</div>;

  return (
    <div>
      <h1>{stream.title}</h1>
      <video
        src={stream.playbackUrl}
        controls
        autoPlay
        className={styles.videoPlayer}
      />
      <Chat streamId={params.streamId} />
    </div>
  );
}

import { useState } from "react";
import "./ClaimButton.css";

type ClaimState = "idle" | "loading" | "success" | "error";

export default function ClaimButton() {
  const [state, setState] = useState<ClaimState>("idle");
  const [message, setMessage] = useState("");

  const claim = async () => {
    setState("loading");
    setMessage("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/claim`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        setState("success");
        setMessage("Reward claimed successfully.");
      } else {
        const body = await res.json().catch(() => ({}));
        setState("error");
        setMessage((body as { error?: string }).error ?? "Claim failed.");
      }
    } catch {
      setState("error");
      setMessage("Unable to reach server.");
    }
  };

  return (
    <div className="claim-button-wrapper">
      <button
        className="home-btn primary"
        onClick={claim}
        disabled={state === "loading"}
      >
        {state === "loading" ? "Processing…" : "Claim Reward"}
      </button>
      {message && (
        <p className={`claim-button-message claim-button-message--${state}`}>
          {message}
        </p>
      )}
    </div>
  );
}

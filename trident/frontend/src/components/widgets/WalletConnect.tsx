import { useState } from "react";
import "./WalletConnect.css";

interface Props {
  onConnected: (wallet: string) => void;
}

export default function WalletConnect({ onConnected }: Props) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const connectWallet = async () => {
    setError("");
    setLoading(true);
    try {
      const provider = (
        window as Window & {
          solana?: {
            connect: () => Promise<{ publicKey: { toString: () => string } }>;
            signMessage: (
              msg: Uint8Array,
              encoding: string,
            ) => Promise<{ signature: Uint8Array }>;
          };
        }
      ).solana;
      if (!provider) {
        setError("No Solana wallet detected. Install Phantom or Backpack.");
        return;
      }

      const resp = await provider.connect();
      const wallet = resp.publicKey.toString();

      const message = `Authenticate with Trident: ${wallet}`;
      const encoded = new TextEncoder().encode(message);
      const { signature } = await provider.signMessage(encoded, "utf8");

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
          signature: Array.from(signature),
          message,
        }),
      });

      if (!res.ok) {
        setError("Authentication rejected by server.");
        return;
      }

      onConnected(wallet);
    } catch {
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-connect">
      <button
        className="home-btn primary"
        onClick={connectWallet}
        disabled={loading}
      >
        {loading ? "Connecting…" : "Connect Wallet"}
      </button>
      {error && <p className="wallet-connect-error">{error}</p>}
    </div>
  );
}

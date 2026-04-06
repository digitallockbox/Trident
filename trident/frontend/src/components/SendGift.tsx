// SendGift.tsx — UI for sending a gift/tip/product
// Place in: frontend/src/components/SendGift.tsx

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { buildSplitInstruction } from "../logic/trident-sdk";
import { SplitInstruction } from "../types/trident-sdk";
import { sendGiftTx } from "../logic/trident-sdk";

const SendGift: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [mint, setMint] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSend = async () => {
    if (!connected || !publicKey) {
      setStatus("Please connect your wallet.");
      return;
    }
    if (!amount || !recipient || !mint) {
      setStatus("All fields are required.");
      return;
    }
    const ix: SplitInstruction = {
      amount: Number(amount),
      creator: publicKey.toBase58(),
      platform: recipient,
      mint,
    };
    setStatus("Sending...");
    const result = await sendGiftTx(ix);
    if (result.success) {
      setStatus("Transaction sent! Signature: " + result.signature);
    } else {
      setStatus("Error: " + result.error);
    }
  };

  return (
    <div
      style={{
        border: "1px solid #eee",
        padding: 16,
        borderRadius: 8,
        maxWidth: 400,
      }}
    >
      <h3>Send Gift / Tip / Product</h3>
      <input
        type="text"
        placeholder="Recipient (platform pubkey)"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="text"
        placeholder="Amount (lamports)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="text"
        placeholder="Mint address"
        value={mint}
        onChange={(e) => setMint(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <button onClick={handleSend} style={{ width: "100%" }}>
        Send
      </button>
      {status && <div style={{ marginTop: 8 }}>{status}</div>}
    </div>
  );
};

export default SendGift;

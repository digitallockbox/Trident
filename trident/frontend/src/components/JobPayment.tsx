// JobPayment.tsx — UI for paying a worker for a job
// Place in: frontend/src/components/JobPayment.tsx

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { buildJobPaymentInstruction } from "../logic/trident-sdk";
import { JobPaymentInstruction } from "../types/trident-sdk";

const JobPayment: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const [jobId, setJobId] = useState("");
  const [worker, setWorker] = useState("");
  const [amount, setAmount] = useState("");
  const [mint, setMint] = useState("");
  const [affiliate, setAffiliate] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handlePay = async () => {
    if (!connected || !publicKey) {
      setStatus("Please connect your wallet.");
      return;
    }
    if (!jobId || !worker || !amount || !mint) {
      setStatus("All fields except affiliate are required.");
      return;
    }
    const ix: JobPaymentInstruction = {
      jobId,
      worker,
      employer: publicKey.toBase58(),
      amount: Number(amount),
      mint,
      affiliate: affiliate || undefined,
    };
    // Build instruction (would send via Solana transaction in real app)
    const instruction = buildJobPaymentInstruction(ix);
    setStatus("Instruction built: " + instruction.toString());
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
      <h3>Pay for Job</h3>
      <input
        type="text"
        placeholder="Job ID"
        value={jobId}
        onChange={(e) => setJobId(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="text"
        placeholder="Worker (pubkey)"
        value={worker}
        onChange={(e) => setWorker(e.target.value)}
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
      <input
        type="text"
        placeholder="Affiliate (optional)"
        value={affiliate}
        onChange={(e) => setAffiliate(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <button onClick={handlePay} style={{ width: "100%" }}>
        Pay
      </button>
      {status && <div style={{ marginTop: 8 }}>{status}</div>}
    </div>
  );
};

export default JobPayment;

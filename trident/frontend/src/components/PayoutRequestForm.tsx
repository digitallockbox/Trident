import React, { useState } from "react";
import { requestPayout, PayoutResponse } from "../api/omega.api";
import styles from "./PayoutRequestForm.module.css";

export function PayoutRequestForm({
  authHeaders,
}: {
  authHeaders: Record<string, string>;
}) {
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<PayoutResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      setError("Enter a valid amount greater than zero.");
      return;
    }

    try {
      setLoading(true);
      const response = await requestPayout(
        {
          amountLamports: Math.floor(numericAmount * 1_000_000_000),
        },
        authHeaders,
      );
      setResult(response);
    } catch (err: any) {
      setError(err?.message || "Payout request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount in SOL"
        min="0.000000001"
        step="0.000000001"
        required
        className={styles.input}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Request Payout"}
      </button>
      {result && (
        <pre className={styles.result}>{JSON.stringify(result, null, 2)}</pre>
      )}
      {error && <div className={styles.error}>{error}</div>}
    </form>
  );
}

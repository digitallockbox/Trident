// ProductPurchase.tsx — UI for purchasing a product
// Place in: frontend/src/components/ProductPurchase.tsx

import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { buildProductSaleInstruction } from "../logic/trident-sdk";
import { ProductSaleInstruction } from "../types/trident-sdk";

const ProductPurchase: React.FC = () => {
  const { publicKey, connected } = useWallet();
  const [productId, setProductId] = useState("");
  const [seller, setSeller] = useState("");
  const [amount, setAmount] = useState("");
  const [mint, setMint] = useState("");
  const [affiliate, setAffiliate] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handlePurchase = async () => {
    if (!connected || !publicKey) {
      setStatus("Please connect your wallet.");
      return;
    }
    if (!productId || !seller || !amount || !mint) {
      setStatus("All fields except affiliate are required.");
      return;
    }
    const ix: ProductSaleInstruction = {
      productId,
      buyer: publicKey.toBase58(),
      seller,
      amount: Number(amount),
      mint,
      affiliate: affiliate || undefined,
    };
    // Build instruction (would send via Solana transaction in real app)
    const instruction = buildProductSaleInstruction(ix);
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
      <h3>Purchase Product</h3>
      <input
        type="text"
        placeholder="Product ID"
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        style={{ width: "100%", marginBottom: 8 }}
      />
      <input
        type="text"
        placeholder="Seller (pubkey)"
        value={seller}
        onChange={(e) => setSeller(e.target.value)}
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
      <button onClick={handlePurchase} style={{ width: "100%" }}>
        Purchase
      </button>
      {status && <div style={{ marginTop: 8 }}>{status}</div>}
    </div>
  );
};

export default ProductPurchase;

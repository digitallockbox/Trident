// OmegaPage.tsx
// Frontend page for interacting with the Omega engine

import React, { useState } from "react";
import { useEngine } from "../../hooks/useEngine";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import FormField from "../../components/FormField";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Button from "../../components/Button";
import EngineResult from "../../components/EngineResult";
import RunHistoryPanel from "../../components/RunHistoryPanel";
import { useToast } from "../../components/ToastContext";

export default function OmegaPage() {
  const { execute, loading, result, error } = useEngine("omega");
  const [numbers, setNumbers] = useState("");
  const [operation, setOperation] = useState<"sum" | "product">("sum");
  const showToast = useToast();
  const [lastInput, setLastInput] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nums = numbers
      .split(",")
      .map((n) => parseFloat(n.trim()))
      .filter((n) => !isNaN(n));

    if (nums.length === 0) {
      showToast("Please enter at least one valid number.", "error");
      return;
    }

    const input = { numbers: nums, operation };
    setLastInput(input);
    const output = await execute(input);

    // Record run in backend history
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/history/omega`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input, output }),
    });
  };

  return (
    <>
      <PageHeader
        title="Omega Engine"
        subtitle="Perform numerical operations using the Omega engine."
      />

      <Card title="Input">
        <form onSubmit={handleSubmit}>
          <FormField label="Numbers (comma separated)">
            <Input
              value={numbers}
              onChange={(e) => setNumbers(e.target.value)}
              placeholder="e.g. 1,2,3"
            />
          </FormField>

          <FormField label="Operation">
            <Select
              value={operation}
              onChange={(e) =>
                setOperation(e.target.value as "sum" | "product")
              }
            >
              <option value="sum">Sum</option>
              <option value="product">Product</option>
            </Select>
          </FormField>

          <Button type="submit" loading={loading}>
            Run Engine
          </Button>
        </form>
      </Card>

      {error && <div style={{ color: "red", marginTop: 16 }}>{error}</div>}
      <EngineResult result={result} />

      <RunHistoryPanel engine="omega" />
    </>
  );
}

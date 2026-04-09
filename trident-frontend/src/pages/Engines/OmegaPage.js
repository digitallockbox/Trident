import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
// OmegaPage.tsx
// Frontend page for interacting with the Omega engine
import { useState } from "react";
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
    const [operation, setOperation] = useState("sum");
    const showToast = useToast();
    const [lastInput, setLastInput] = useState(null);
    const handleSubmit = async (e) => {
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
    return (_jsxs(_Fragment, { children: [_jsx(PageHeader, { title: "Omega Engine", subtitle: "Perform numerical operations using the Omega engine." }), _jsx(Card, { title: "Input", children: _jsxs("form", { onSubmit: handleSubmit, children: [_jsx(FormField, { label: "Numbers (comma separated)", children: _jsx(Input, { value: numbers, onChange: (e) => setNumbers(e.target.value), placeholder: "e.g. 1,2,3" }) }), _jsx(FormField, { label: "Operation", children: _jsxs(Select, { value: operation, onChange: (e) => setOperation(e.target.value), children: [_jsx("option", { value: "sum", children: "Sum" }), _jsx("option", { value: "product", children: "Product" })] }) }), _jsx(Button, { type: "submit", loading: loading, children: "Run Engine" })] }) }), error && _jsx("div", { style: { color: "red", marginTop: 16 }, children: error }), _jsx(EngineResult, { result: result }), _jsx(RunHistoryPanel, { engine: "omega" })] }));
}

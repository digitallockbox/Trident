import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// OverwatchPage.tsx
// Frontend page for interacting with the Overwatch engine
import { useState } from "react";
import { useOverwatchEngine, } from "../../hooks/engines/useOverwatchEngine";
export default function OverwatchPage() {
    const { execute, loading, result, error } = useOverwatchEngine();
    const [target, setTarget] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { target };
        execute(payload);
    };
    return (_jsxs("div", { style: { maxWidth: 500, margin: "0 auto", padding: 32 }, children: [_jsx("h1", { children: "Overwatch Engine" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { children: [_jsx("label", { children: "Target:" }), _jsx("input", { type: "text", value: target, onChange: (e) => setTarget(e.target.value), placeholder: "Enter target for Overwatch engine", style: { width: "100%" } })] }), _jsx("button", { type: "submit", disabled: loading, style: { marginTop: 24 }, children: loading ? "Processing..." : "Run Engine" })] }), error && _jsx("div", { style: { color: "red", marginTop: 16 }, children: error }), result && result.status === "success" && (_jsxs("div", { style: { marginTop: 16 }, children: [_jsx("strong", { children: "Result:" }), " ", JSON.stringify(result.result)] }))] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// AegisPage.tsx
// Frontend page for interacting with the Aegis engine
import { useState } from "react";
import { useAegisEngine, } from "../../hooks/engines/useAegisEngine";
export default function AegisPage() {
    const { execute, loading, result, error } = useAegisEngine();
    const [input, setInput] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { input };
        execute(payload);
    };
    return (_jsxs("div", { style: { maxWidth: 500, margin: "0 auto", padding: 32 }, children: [_jsx("h1", { children: "Aegis Engine" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { children: [_jsx("label", { children: "Input:" }), _jsx("input", { type: "text", value: input, onChange: (e) => setInput(e.target.value), placeholder: "Enter input for Aegis engine", style: { width: "100%" } })] }), _jsx("button", { type: "submit", disabled: loading, style: { marginTop: 24 }, children: loading ? "Processing..." : "Run Engine" })] }), error && _jsx("div", { style: { color: "red", marginTop: 16 }, children: error }), result && result.status === "success" && (_jsxs("div", { style: { marginTop: 16 }, children: [_jsx("strong", { children: "Result:" }), " ", JSON.stringify(result.result)] }))] }));
}

"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { api } from "../../lib/api";
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [result, setResult] = useState(null);
    const handleLogin = async () => {
        const res = await api.post("/api/auth/login", { email });
        setResult(res);
    };
    return (_jsxs("div", { style: { padding: 20 }, children: [_jsx("h1", { children: "Login" }), _jsx("input", { placeholder: "email", value: email, onChange: (e) => setEmail(e.target.value), style: { padding: 10, marginRight: 10 } }), _jsx("button", { onClick: handleLogin, children: "Login" }), result && (_jsx("pre", { style: { marginTop: 20 }, children: JSON.stringify(result, null, 2) }))] }));
}

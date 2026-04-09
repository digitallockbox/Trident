"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import useSWR from "swr";
import { api } from "../../lib/api";
import Link from "next/link";
export default function EnginesPage() {
    const { data } = useSWR("/api/engines", api.get);
    return (_jsxs("div", { style: { padding: 20 }, children: [_jsx("h1", { children: "Engines" }), data?.map((engine) => (_jsx("div", { children: _jsxs(Link, { href: `/engines/${engine.id}`, children: [engine.name, " (", engine.id, ")"] }) }, engine.id))), _jsx("pre", { children: JSON.stringify(data, null, 2) })] }));
}

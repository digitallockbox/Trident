"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import useSWR from "swr";
import { api } from "../../lib/api";
export default function SystemPage() {
    const { data: info } = useSWR("/api/system/info", api.get);
    const { data: status } = useSWR("/api/system/status", api.get);
    const { data: engines } = useSWR("/api/engines", api.get);
    return (_jsxs("div", { style: { padding: 20 }, children: [_jsx("h1", { children: "System Overview" }), _jsx("h2", { children: "Info" }), _jsx("pre", { children: JSON.stringify(info, null, 2) }), _jsx("h2", { children: "Status" }), _jsx("pre", { children: JSON.stringify(status, null, 2) }), _jsx("h2", { children: "Engines" }), _jsxs("div", { children: ["Engine count: ", engines?.length ?? 0] }), _jsxs("div", { children: ["Active engines: ", engines?.filter((e) => e.active).length ?? 0] }), _jsx("pre", { children: JSON.stringify(engines, null, 2) })] }));
}

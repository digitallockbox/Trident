"use client";
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import useSWR from "swr";
import { api } from "../../../lib/api";
export default function EngineDetail({ params }) {
    const { id } = params;
    const { data } = useSWR(`/api/engines/${id}`, api.get);
    return (_jsxs("div", { style: { padding: 20 }, children: [_jsxs("h1", { children: ["Engine: ", id] }), _jsx("pre", { children: JSON.stringify(data, null, 2) })] }));
}

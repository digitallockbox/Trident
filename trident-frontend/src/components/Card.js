import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function Card({ children, title, subtitle }) {
    return (_jsxs("div", { className: "card", children: [title && _jsx("h2", { children: title }), subtitle && _jsx("h4", { children: subtitle }), children] }));
}

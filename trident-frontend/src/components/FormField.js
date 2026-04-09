import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function FormField({ children, label }) {
    return (_jsxs("div", { className: "form-field", children: [label && _jsx("label", { children: label }), children] }));
}

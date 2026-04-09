import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from "next/link";
export const Header = () => {
    return (_jsxs("header", { style: { padding: 20, borderBottom: "1px solid #ddd" }, children: [_jsx(Link, { href: "/", children: "Home" }), " | ", _jsx(Link, { href: "/system", children: "System" }), " |", " ", _jsx(Link, { href: "/engines", children: "Engines" }), " | ", _jsx(Link, { href: "/login", children: "Login" })] }));
};

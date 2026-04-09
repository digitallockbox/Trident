import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Header } from "../components/layout/header";
export default function RootLayout({ children }) {
    return (_jsx("html", { children: _jsxs("body", { children: [_jsx(Header, {}), _jsx("main", { children: children })] }) }));
}

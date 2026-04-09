import { jsx as _jsx } from "react/jsx-runtime";
export default function Button({ children, loading, ...props }) {
    return (_jsx("button", { disabled: loading, ...props, children: loading ? "Loading..." : children }));
}

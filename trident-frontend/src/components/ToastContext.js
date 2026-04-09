// Placeholder for ToastContext
import { createContext, useContext } from "react";
const ToastContext = createContext({ showToast: () => { } });
export function useToast() {
    return useContext(ToastContext);
}
export default ToastContext;

// Placeholder for ToastContext
import React, { createContext, useContext } from "react";
type ToastContextType = { showToast: (msg: string, type?: string) => void };
const ToastContext = createContext<ToastContextType>({ showToast: () => {} });
export function useToast() {
  return useContext(ToastContext);
}
export default ToastContext;

"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface ToastMessage {
  id: string;
  type: "info" | "success" | "warning" | "error";
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastMessage["type"]) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: ToastMessage["type"] = "warning") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Fixed Toast Container */}
      <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs space-y-2 px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3 rounded-2xl text-xs font-semibold shadow-lg flex items-center gap-2 border transition-all duration-300 animate-slideDown ${
              toast.type === "warning"
                ? "bg-amber-900 text-amber-100 border-amber-700"
                : toast.type === "error"
                ? "bg-rose-900 text-rose-100 border-rose-700"
                : toast.type === "success"
                ? "bg-emerald-900 text-emerald-100 border-emerald-700"
                : "bg-zinc-900 text-zinc-100 border-zinc-700"
            }`}
          >
            <span className="text-base">
              {toast.type === "warning"
                ? "⚠️"
                : toast.type === "error"
                ? "❌"
                : toast.type === "success"
                ? "✅"
                : "ℹ️"}
            </span>
            <span className="flex-1">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

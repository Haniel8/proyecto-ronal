"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
};

type ToastContextType = {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

const config = {
  success: { icon: <CheckCircle size={18} />, bg: "bg-green-50", border: "border-green-200", icon_color: "text-green-600", title_color: "text-green-800" },
  error:   { icon: <XCircle size={18} />,    bg: "bg-red-50",   border: "border-red-200",   icon_color: "text-red-600",   title_color: "text-red-800" },
  warning: { icon: <AlertCircle size={18} />,bg: "bg-yellow-50",border: "border-yellow-200",icon_color: "text-yellow-600",title_color: "text-yellow-800" },
  info:    { icon: <Info size={18} />,       bg: "bg-blue-50",  border: "border-blue-200",  icon_color: "text-blue-600",  title_color: "text-blue-800" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((type: ToastType, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const ctx: ToastContextType = {
    success: (t, m) => add("success", t, m),
    error:   (t, m) => add("error", t, m),
    warning: (t, m) => add("warning", t, m),
    info:    (t, m) => add("info", t, m),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const c = config[toast.type];
          return (
            <div key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-lg min-w-[280px] max-w-[360px] ${c.bg} ${c.border} animate-[slideIn_0.3s_ease-out]`}>
              <span className={`flex-shrink-0 mt-0.5 ${c.icon_color}`}>{c.icon}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold ${c.title_color}`}>{toast.title}</p>
                {toast.message && <p className="text-xs text-gray-500 mt-0.5">{toast.message}</p>}
              </div>
              <button onClick={() => remove(toast.id)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

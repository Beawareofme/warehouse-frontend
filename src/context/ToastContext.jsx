import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]); // { id, type, msg }

  const push = useCallback((type, msg, ttl=3000) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    setToasts((t) => [...t, { id, type, msg }]);
    setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), ttl);
  }, []);

  const api = useMemo(() => ({
    success: (m, ttl) => push("success", m, ttl),
    error:   (m, ttl) => push("error", m, ttl),
    info:    (m, ttl) => push("info", m, ttl),
  }), [push]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      {/* host */}
      <div className="fixed top-4 right-4 z-[1000] space-y-2">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`rounded-lg px-4 py-2 shadow text-sm
              ${t.type === "success" ? "bg-green-600 text-white" :
                t.type === "error"   ? "bg-red-600 text-white"   :
                                       "bg-gray-800 text-gray-100"}`}
          >
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

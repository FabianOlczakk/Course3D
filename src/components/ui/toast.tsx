"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { CheckCircle2, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error";

export interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = ++counter;
      setToasts((prev) => [...prev, { id, message, variant }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex max-w-[calc(100vw-2rem)] flex-col gap-2">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onClose,
}: {
  toast: ToastItem;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isError = toast.variant === "error";

  return (
    <div
      role="status"
      className={cn(
        "glow-card animate-in slide-in-from-right flex items-center gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg duration-200",
        isError
          ? "border-red-500/50 text-red-300"
          : "border-[var(--border-glow)] text-text-primary"
      )}
    >
      {isError ? (
        <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
      ) : (
        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
      )}
      <span className="min-w-0 flex-1">{toast.message}</span>
      <button
        type="button"
        aria-label="Zamknij"
        onClick={onClose}
        className="shrink-0 text-text-muted hover:text-text-primary"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast musi być użyte wewnątrz ToastProvider.");
  }
  return ctx;
}

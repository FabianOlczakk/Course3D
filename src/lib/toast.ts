"use client";

import { useToastContext, type ToastVariant } from "@/components/ui/toast";

/**
 * Prosty hook do wyświetlania powiadomień toast.
 * Użycie: const toast = useToast(); toast.success("..."); toast.error("...");
 */
export function useToast() {
  const { show } = useToastContext();
  return {
    show: (message: string, variant?: ToastVariant) => show(message, variant),
    success: (message: string) => show(message, "success"),
    error: (message: string) => show(message, "error"),
  };
}

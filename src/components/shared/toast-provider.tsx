"use client";

import React, { createContext, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

// =============================================================================
// Toast Provider — global toast accessible from any page via useGlobalToast()
// =============================================================================

type ToastVariant = "success" | "error" | "info";

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
  error: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
  info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
};

export function ToastProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg",
            VARIANT_STYLES[toast.variant]
          )}
        >
          {toast.message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

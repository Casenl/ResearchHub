"use client";

import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

// =============================================================================
// Toast hook — lightweight inline toast with variant support
// =============================================================================

type ToastVariant = "success" | "error" | "info";

interface UseToastReturn {
  show: (msg: string, variant?: ToastVariant) => void;
  ToastNode: React.ReactNode;
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200",
  error: "border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200",
  info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200",
};

export function useToast(): UseToastReturn {
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);

  const show = useCallback((msg: string, variant: ToastVariant = "success") => {
    setToast({ message: msg, variant });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const ToastNode: React.ReactNode = toast ? (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 rounded-lg border px-4 py-3 text-sm font-medium shadow-lg",
        VARIANT_STYLES[toast.variant]
      )}
    >
      {toast.message}
    </div>
  ) : null;

  return { show, ToastNode };
}

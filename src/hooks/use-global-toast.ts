"use client";

import { useContext } from "react";
import { ToastContext } from "@/components/shared/toast-provider";

export function useGlobalToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useGlobalToast must be used within a ToastProvider");
  }
  return ctx;
}

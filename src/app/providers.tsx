"use client";

import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { ToastProvider } from "@/components/shared/toast-provider";

export function Providers({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>{children}</AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

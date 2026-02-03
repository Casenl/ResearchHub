"use client";

import { AuthProvider } from "@/hooks/use-auth";

export function Providers({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <AuthProvider>{children}</AuthProvider>;
}

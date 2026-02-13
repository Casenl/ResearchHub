"use client";

import React from "react";
import { ProtectedRoute } from "@/components/shared/protected-route";

// =============================================================================
// Admin Layout
// =============================================================================
// Wraps all pages under /admin with role-based access control.

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>;
}

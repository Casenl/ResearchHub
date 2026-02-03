import React from "react";

// =============================================================================
// Admin Layout
// =============================================================================
// Wraps all pages under /admin. Currently a pass-through layout that can be
// extended later with admin-specific navigation, breadcrumbs, or access guards.

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

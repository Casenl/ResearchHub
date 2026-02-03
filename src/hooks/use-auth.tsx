"use client";

import React, { createContext, useContext, useMemo } from "react";
import type { User, UserRole } from "@/types";

// -----------------------------------------------------------------------------
// Auth Context Types
// -----------------------------------------------------------------------------

interface AuthContextValue {
  /** The currently authenticated user. */
  user: User;
  /** Whether the current user has the admin role. */
  isAdmin: boolean;
  /** Whether the current user has the researcher role. */
  isResearcher: boolean;
  /** Whether the current user has the viewer role. */
  isViewer: boolean;
  /** The current user's role. */
  role: UserRole;
}

// -----------------------------------------------------------------------------
// Mock User (MVP hardcoded admin)
// -----------------------------------------------------------------------------

const MOCK_USER: User = {
  id: "user-jan",
  name: "Jan de Vries",
  email: "jan@itq.nl",
  role: "admin",
  domain_ids: ["domain-sec", "domain-hc"],
};

// -----------------------------------------------------------------------------
// Context
// -----------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

// -----------------------------------------------------------------------------
// Provider
// -----------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<AuthContextValue>(() => {
    const role = MOCK_USER.role;
    return {
      user: MOCK_USER,
      role,
      isAdmin: role === "admin",
      isResearcher: role === "researcher",
      isViewer: role === "viewer",
    };
  }, []);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// -----------------------------------------------------------------------------
// Hook
// -----------------------------------------------------------------------------

/**
 * Access the current authentication state.
 * Must be used within an `<AuthProvider>`.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

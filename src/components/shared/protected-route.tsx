"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";

import { useAuth } from "@/hooks/use-auth";

import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Minimum role required. If not specified, any authenticated user can access. */
  requiredRole?: UserRole;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  viewer: 0,
  researcher: 1,
  admin: 2,
};

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps): React.JSX.Element | null {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (
    requiredRole &&
    ROLE_HIERARCHY[user.role] < ROLE_HIERARCHY[requiredRole]
  ) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-lg font-semibold">Access Denied</p>
        <p className="text-sm text-muted-foreground">
          You need the <span className="font-medium">{requiredRole}</span> role
          to access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

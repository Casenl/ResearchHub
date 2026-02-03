"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
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

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
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

"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ROLE_OPTIONS, ROLE_BADGE_STYLES } from "./user-constants";

import type { UserRole } from "@/types";

// =============================================================================
// Inline Role Dropdown
// =============================================================================

interface UserRoleDropdownProps {
  userId: string;
  currentRole: UserRole;
  onChangeRole: (userId: string, newRole: UserRole) => void;
}

export function UserRoleDropdown({
  userId,
  currentRole,
  onChangeRole,
}: UserRoleDropdownProps): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors",
          ROLE_BADGE_STYLES[currentRole],
        )}
      >
        {currentRole}
        <ChevronDown className="h-3 w-3" />
      </button>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 z-50 mt-1 w-32 rounded-md border border-border bg-background py-1 shadow-lg">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => {
                  onChangeRole(userId, r);
                  setIsOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-3 py-1.5 text-xs capitalize transition-colors hover:bg-muted",
                  r === currentRole && "font-semibold text-primary",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

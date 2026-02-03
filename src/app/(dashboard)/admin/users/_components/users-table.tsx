"use client";

import React from "react";
import { Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserRoleDropdown } from "./user-role-dropdown";
import { getDomainName } from "./user-constants";

import type { User, UserRole } from "@/types";

// =============================================================================
// Users Table
// =============================================================================

interface UsersTableProps {
  users: User[];
  onChangeRole: (userId: string, newRole: UserRole) => void;
  onEdit: (user: User) => void;
}

export function UsersTable({
  users,
  onChangeRole,
  onEdit,
}: UsersTableProps): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Name
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Email
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Role
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Domains
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, idx) => (
            <UsersTableRow
              key={user.id}
              user={user}
              isStriped={idx % 2 !== 0}
              onChangeRole={onChangeRole}
              onEdit={onEdit}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================================
// Single Table Row
// =============================================================================

interface UsersTableRowProps {
  user: User;
  isStriped: boolean;
  onChangeRole: (userId: string, newRole: UserRole) => void;
  onEdit: (user: User) => void;
}

function UsersTableRow({
  user,
  isStriped,
  onChangeRole,
  onEdit,
}: UsersTableRowProps): React.JSX.Element {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <tr
      className={cn(
        "border-b border-border transition-colors hover:bg-muted/30",
        isStriped ? "bg-muted/10" : "bg-background",
      )}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {initials}
          </div>
          <span className="font-medium">{user.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
      <td className="px-4 py-3">
        <UserRoleDropdown
          userId={user.id}
          currentRole={user.role}
          onChangeRole={onChangeRole}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {user.domain_ids.map((domainId) => (
            <Badge key={domainId} variant="info">
              {getDomainName(domainId)}
            </Badge>
          ))}
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(user)}
          title="Edit user"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
}

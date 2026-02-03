"use client";

import React, { useState } from "react";

import { UserPlus } from "lucide-react";

import { generateId } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { useToast } from "./_components/use-toast";
import { UserInviteForm } from "./_components/user-invite-form";
import { UserStatsGrid } from "./_components/user-stats-grid";
import { UsersTable } from "./_components/users-table";
import { INITIAL_USERS } from "./_components/user-constants";

import type { User, UserRole } from "@/types";

// =============================================================================
// Main Page
// =============================================================================

export default function UsersPage(): React.JSX.Element {
  const [users, setUsers] = useState<User[]>([...INITIAL_USERS]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { show, ToastNode } = useToast();

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleInvite = (data: Omit<User, "id">) => {
    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...u, ...data } : u,
        ),
      );
      show(`User "${data.name}" updated successfully`);
      setEditingUser(null);
    } else {
      const newUser: User = { id: generateId(), ...data };
      setUsers((prev) => [...prev, newUser]);
      show(`Invitation sent to ${data.email}`);
    }
    setIsFormVisible(false);
  };

  const handleChangeRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
    );
    const user = users.find((u) => u.id === userId);
    show(`${user?.name}'s role changed to ${newRole}`);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormVisible(true);
  };

  const handleCancelForm = () => {
    setIsFormVisible(false);
    setEditingUser(null);
  };

  const handleOpenInvite = () => {
    setEditingUser(null);
    setIsFormVisible(true);
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            User Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage portal users, roles, and domain assignments
          </p>
        </div>
        <Button onClick={handleOpenInvite}>
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Summary Stats */}
      <UserStatsGrid users={users} />

      {/* Invite / Edit Form */}
      {isFormVisible && (
        <UserInviteForm
          onSave={handleInvite}
          onCancel={handleCancelForm}
          initial={editingUser}
        />
      )}

      {/* Users Table */}
      <UsersTable
        users={users}
        onChangeRole={handleChangeRole}
        onEdit={handleEdit}
      />

      {ToastNode}
    </div>
  );
}

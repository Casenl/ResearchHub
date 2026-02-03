"use client";

import React, { useState } from "react";

import { Loader2, UserPlus } from "lucide-react";

import { generateId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUsers, useUpsertUser, useUpdateUser } from "@/hooks/use-users";

import { useToast } from "./_components/use-toast";
import { UserInviteForm } from "./_components/user-invite-form";
import { UserStatsGrid } from "./_components/user-stats-grid";
import { UsersTable } from "./_components/users-table";

import type { User, UserRole } from "@/types";

// =============================================================================
// Main Page
// =============================================================================

export default function UsersPage(): React.JSX.Element {
  const { data: users, isLoading } = useUsers();
  const { upsertUser } = useUpsertUser();
  const { updateUser } = useUpdateUser();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { show, ToastNode } = useToast();

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleInvite = async (data: Omit<User, "id">) => {
    try {
      if (editingUser) {
        await upsertUser({ ...editingUser, ...data });
        show(`User "${data.name}" updated successfully`);
        setEditingUser(null);
      } else {
        const newUser: User = { id: generateId(), ...data };
        await upsertUser(newUser);
        show(`Invitation sent to ${data.email}`);
      }
      setIsFormVisible(false);
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const handleChangeRole = async (userId: string, newRole: UserRole) => {
    try {
      await updateUser(userId, { role: newRole });
      const user = users.find((u) => u.id === userId);
      show(`${user?.name}'s role changed to ${newRole}`);
    } catch (err) {
      console.error("Error changing role:", err);
    }
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

      {/* Loading */}
      {isLoading && users.length === 0 && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

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

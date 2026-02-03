"use client";

import React, { useState, useCallback } from "react";
import {
  Users,
  UserPlus,
  Edit,
  Shield,
  Mail,
  ChevronDown,
} from "lucide-react";
import { cn, generateId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DOMAINS } from "@/data/domains";
import type { User, UserRole } from "@/types";

// =============================================================================
// Constants
// =============================================================================

const ROLE_OPTIONS: UserRole[] = ["admin", "researcher", "viewer"];

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  admin: "border-transparent bg-red-100 text-red-800",
  researcher: "border-transparent bg-blue-100 text-blue-800",
  viewer: "border-transparent bg-gray-100 text-gray-700",
};

// =============================================================================
// Mock Users
// =============================================================================

const INITIAL_USERS: User[] = [
  {
    id: "user-jan",
    name: "Jan de Vries",
    email: "jan@itq.nl",
    role: "admin",
    domain_ids: ["domain-sec", "domain-hc"],
  },
  {
    id: "user-sophie",
    name: "Sophie Bakker",
    email: "sophie@itq.nl",
    role: "researcher",
    domain_ids: ["domain-dw"],
  },
  {
    id: "user-mark",
    name: "Mark van den Berg",
    email: "mark@itq.nl",
    role: "researcher",
    domain_ids: ["domain-sec"],
  },
  {
    id: "user-lisa",
    name: "Lisa Jansen",
    email: "lisa@itq.nl",
    role: "viewer",
    domain_ids: ["domain-ai"],
  },
  {
    id: "user-tom",
    name: "Tom Hendriks",
    email: "tom@itq.nl",
    role: "viewer",
    domain_ids: ["domain-hc"],
  },
];

// =============================================================================
// Toast helper
// =============================================================================

function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const Toast = message ? (
    <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-lg">
      {message}
    </div>
  ) : null;

  return { show, Toast };
}

// =============================================================================
// Domain name helper
// =============================================================================

function getDomainName(id: string): string {
  const domain = DOMAINS.find((d) => d.id === id);
  return domain ? domain.name : id;
}

// =============================================================================
// Invite User Dialog (inline form)
// =============================================================================

interface InviteFormProps {
  onSave: (user: Omit<User, "id">) => void;
  onCancel: () => void;
  initial?: User | null;
}

function InviteForm({ onSave, onCancel, initial }: InviteFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState<UserRole>(initial?.role ?? "viewer");
  const [selectedDomains, setSelectedDomains] = useState<string[]>(
    initial?.domain_ids ?? []
  );

  const toggleDomain = (domainId: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((d) => d !== domainId)
        : [...prev, domainId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onSave({ name, email, role, domain_ids: selectedDomains });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-muted/30 p-4"
    >
      <h4 className="mb-3 text-sm font-semibold">
        {initial ? "Edit User" : "Invite New User"}
      </h4>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Name
          </label>
          <Input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Email
          </label>
          <Input
            type="email"
            placeholder="user@itq.nl"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Role
          </label>
          <select
            className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            {ROLE_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">
            Domains
          </label>
          <div className="flex flex-wrap gap-2 rounded-md border border-border bg-background p-2">
            {DOMAINS.map((domain) => (
              <label
                key={domain.id}
                className="flex items-center gap-1.5 text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedDomains.includes(domain.id)}
                  onChange={() => toggleDomain(domain.id)}
                  className="h-4 w-4 rounded accent-primary"
                />
                {domain.name}
              </label>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button type="submit" size="sm">
          <Mail className="h-4 w-4" />
          {initial ? "Update User" : "Send Invite"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

// =============================================================================
// Role Dropdown (inline edit)
// =============================================================================

interface RoleDropdownProps {
  userId: string;
  currentRole: UserRole;
  onChangeRole: (userId: string, newRole: UserRole) => void;
}

function RoleDropdown({ userId, currentRole, onChangeRole }: RoleDropdownProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-2.5 py-0.5 text-xs font-semibold transition-colors",
          ROLE_BADGE_STYLES[currentRole]
        )}
      >
        {currentRole}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-50 mt-1 w-32 rounded-md border border-border bg-background py-1 shadow-lg">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => {
                  onChangeRole(userId, r);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center px-3 py-1.5 text-xs capitalize transition-colors hover:bg-muted",
                  r === currentRole && "font-semibold text-primary"
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

// =============================================================================
// Main Page
// =============================================================================

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([...INITIAL_USERS]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { show, Toast } = useToast();

  const handleInvite = (data: Omit<User, "id">) => {
    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id ? { ...u, ...data } : u
        )
      );
      show(`User "${data.name}" updated successfully`);
      setEditingUser(null);
    } else {
      const newUser: User = { id: generateId(), ...data };
      setUsers((prev) => [...prev, newUser]);
      show(`Invitation sent to ${data.email}`);
    }
    setShowForm(false);
  };

  const handleChangeRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    const user = users.find((u) => u.id === userId);
    show(`${user?.name}'s role changed to ${newRole}`);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  // Summary counts
  const adminCount = users.filter((u) => u.role === "admin").length;
  const researcherCount = users.filter((u) => u.role === "researcher").length;
  const viewerCount = users.filter((u) => u.role === "viewer").length;

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
        <Button
          onClick={() => {
            setEditingUser(null);
            setShowForm(true);
          }}
        >
          <UserPlus className="h-4 w-4" />
          Invite User
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            Total Users
          </div>
          <p className="mt-1 text-2xl font-bold">{users.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4 text-red-500" />
            Admins
          </div>
          <p className="mt-1 text-2xl font-bold">{adminCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Edit className="h-4 w-4 text-blue-500" />
            Researchers
          </div>
          <p className="mt-1 text-2xl font-bold">{researcherCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4 text-gray-500" />
            Viewers
          </div>
          <p className="mt-1 text-2xl font-bold">{viewerCount}</p>
        </div>
      </div>

      {/* Invite / Edit Form */}
      {showForm && (
        <InviteForm
          onSave={handleInvite}
          onCancel={handleCancelForm}
          initial={editingUser}
        />
      )}

      {/* Users Table */}
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
              <tr
                key={user.id}
                className={cn(
                  "border-b border-border transition-colors hover:bg-muted/30",
                  idx % 2 === 0 ? "bg-background" : "bg-muted/10"
                )}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <RoleDropdown
                    userId={user.id}
                    currentRole={user.role}
                    onChangeRole={handleChangeRole}
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
                    onClick={() => handleEdit(user)}
                    title="Edit user"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {Toast}
    </div>
  );
}

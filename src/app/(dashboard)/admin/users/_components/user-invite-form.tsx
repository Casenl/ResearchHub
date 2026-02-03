"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DOMAINS } from "@/data/domains";
import { ROLE_OPTIONS } from "./user-constants";

import type { User, UserRole } from "@/types";

// =============================================================================
// User Invite / Edit Form
// =============================================================================

interface UserInviteFormProps {
  onSave: (user: Omit<User, "id">) => void;
  onCancel: () => void;
  initial?: User | null;
}

export function UserInviteForm({
  onSave,
  onCancel,
  initial,
}: UserInviteFormProps): React.JSX.Element {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [role, setRole] = useState<UserRole>(initial?.role ?? "viewer");
  const [selectedDomains, setSelectedDomains] = useState<string[]>(
    initial?.domain_ids ?? [],
  );

  const isEditing = Boolean(initial);

  const toggleDomain = (domainId: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domainId)
        ? prev.filter((d) => d !== domainId)
        : [...prev, domainId],
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
        {isEditing ? "Edit User" : "Invite New User"}
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
          {isEditing ? "Update User" : "Send Invite"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

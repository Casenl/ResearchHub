"use client";

import React, { useState } from "react";

import { Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import type { ApiKeyPermission } from "@/types";

// =============================================================================
// Types
// =============================================================================

export interface ApiKeyFormData {
  name: string;
  permissions: ApiKeyPermission;
  agent_id: string;
  agent_name: string;
  agent_version: string;
  run_id: string;
  expires_at: string;
}

interface ApiKeyFormProps {
  onSubmit: (data: ApiKeyFormData) => Promise<void>;
  onCancel: () => void;
}

// =============================================================================
// Constants
// =============================================================================

const PERMISSION_OPTIONS: { value: ApiKeyPermission; label: string }[] = [
  { value: "read", label: "Read only" },
  { value: "read_write", label: "Read & Write" },
  { value: "admin", label: "Admin" },
];

// =============================================================================
// Component
// =============================================================================

export function ApiKeyForm({ onSubmit, onCancel }: ApiKeyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<ApiKeyFormData>({
    name: "",
    permissions: "read",
    agent_id: "",
    agent_name: "",
    agent_version: "",
    run_id: "",
    expires_at: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      setIsSubmitting(true);
      await onSubmit(form);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Create New API Key</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Name + Permissions */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="ak-name">
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="ak-name"
                name="name"
                placeholder="e.g. researcher-agent-prod"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="ak-permissions">
                Permissions
              </label>
              <select
                id="ak-permissions"
                name="permissions"
                value={form.permissions}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {PERMISSION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Agent Identity */}
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">
              Agent Identity
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                name="agent_id"
                placeholder="Agent ID"
                value={form.agent_id}
                onChange={handleChange}
              />
              <Input
                name="agent_name"
                placeholder="Agent Name"
                value={form.agent_name}
                onChange={handleChange}
              />
              <Input
                name="agent_version"
                placeholder="Agent Version"
                value={form.agent_version}
                onChange={handleChange}
              />
              <Input
                name="run_id"
                placeholder="Run ID"
                value={form.run_id}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 3: Expiry */}
          <div className="max-w-xs space-y-1.5">
            <label className="text-sm font-medium" htmlFor="ak-expires">
              Expires at{" "}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </label>
            <Input
              id="ak-expires"
              name="expires_at"
              type="date"
              value={form.expires_at}
              onChange={handleChange}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting || !form.name.trim()}>
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Key
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}>
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

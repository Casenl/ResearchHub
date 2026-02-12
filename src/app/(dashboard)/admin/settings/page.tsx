"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { subscribeAppSettings, updateAppSettings } from "@/lib/firestore/settings";

import type { AppSettings, UserRole } from "@/types";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AdminSettingsPage(): React.JSX.Element {
  const { isAdmin, isLoading: isAuthLoading } = useAuth();
  const { show: showToast, ToastNode } = useToast();

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newDomain, setNewDomain] = useState("");

  useEffect(() => {
    const unsubscribe = subscribeAppSettings(
      (data) => {
        setSettings(data);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error loading app settings:", err);
        setIsLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  const handleToggleRegistrations = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateAppSettings({
        registrations_enabled: !settings.registrations_enabled,
      });
      showToast(
        settings.registrations_enabled
          ? "Open registration disabled"
          : "Open registration enabled",
        "success"
      );
    } catch (err) {
      console.error("Error updating registration setting:", err);
      showToast("Failed to update setting", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddDomain = async () => {
    if (!settings || !newDomain.trim()) return;
    const domain = newDomain.trim().toLowerCase();
    if (settings.auto_register_domains.includes(domain)) {
      showToast("Domain already in list", "info");
      return;
    }
    setIsSaving(true);
    try {
      await updateAppSettings({
        auto_register_domains: [...settings.auto_register_domains, domain],
      });
      setNewDomain("");
      showToast(`Added ${domain}`, "success");
    } catch (err) {
      console.error("Error adding domain:", err);
      showToast("Failed to add domain", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveDomain = async (domain: string) => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateAppSettings({
        auto_register_domains: settings.auto_register_domains.filter((d) => d !== domain),
      });
      showToast(`Removed ${domain}`, "success");
    } catch (err) {
      console.error("Error removing domain:", err);
      showToast("Failed to remove domain", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDefaultRoleChange = async (role: UserRole) => {
    if (!settings) return;
    setIsSaving(true);
    try {
      await updateAppSettings({ default_role: role });
      showToast(`Default role set to ${role}`, "success");
    } catch (err) {
      console.error("Error updating default role:", err);
      showToast("Failed to update default role", "error");
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        You do not have permission to view this page.
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="py-20 text-center text-muted-foreground">
        Failed to load settings.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Admin Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure registration controls and platform defaults.
        </p>
      </div>

      {/* Registration toggle */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Open Registration</p>
              <p className="text-xs text-muted-foreground">
                Allow anyone to create an account, regardless of email domain.
              </p>
            </div>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleToggleRegistrations}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.registrations_enabled ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                  settings.registrations_enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Auto-register domains */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <p className="text-sm font-medium">Auto-Register Domains</p>
            <p className="text-xs text-muted-foreground">
              Users with these email domains are always allowed to register, even
              when open registration is disabled.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {settings.auto_register_domains.map((domain) => (
              <span
                key={domain}
                className="inline-flex items-center gap-1 rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-medium"
              >
                @{domain}
                <button
                  type="button"
                  onClick={() => handleRemoveDomain(domain)}
                  disabled={isSaving}
                  className="ml-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="example.com"
              className="max-w-xs"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddDomain();
                }
              }}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddDomain}
              disabled={isSaving || !newDomain.trim()}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Default role */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <p className="text-sm font-medium">Default Role</p>
            <p className="text-xs text-muted-foreground">
              Role assigned to new users who register through open registration.
            </p>
          </div>
          <div className="flex gap-2">
            {(["viewer", "researcher", "admin"] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                disabled={isSaving}
                onClick={() => handleDefaultRoleChange(r)}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
                  settings.default_role === r
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {ToastNode}
    </div>
  );
}

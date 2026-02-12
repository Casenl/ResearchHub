"use client";

import React, { useEffect, useRef, useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ImageIcon, Loader2, Plus, Trash2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { getFirebaseStorage } from "@/lib/firebase";
import { subscribeAppSettings, updateAppSettings } from "@/lib/firestore/settings";

import type { AppSettings, UserRole } from "@/types";

const ACCEPTED_IMAGE_TYPES = "image/png,image/jpeg,image/svg+xml,image/webp";
const MAX_LOGO_SIZE = 512 * 1024; // 512 KB

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
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingLoginLogo, setIsUploadingLoginLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const loginLogoInputRef = useRef<HTMLInputElement>(null);

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

  const handleLogoUpload = async (
    file: File,
    field: "logo_url" | "logo_login_url"
  ) => {
    if (file.size > MAX_LOGO_SIZE) {
      showToast("File too large (max 512 KB)", "error");
      return;
    }
    const setUploading = field === "logo_url" ? setIsUploadingLogo : setIsUploadingLoginLogo;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() ?? "png";
      const storagePath = field === "logo_url" ? `branding/logo.${ext}` : `branding/logo-login.${ext}`;
      const storage = getFirebaseStorage();
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, file, { contentType: file.type });
      const url = await getDownloadURL(storageRef);
      await updateAppSettings({ [field]: url });
      showToast("Logo uploaded", "success");
    } catch (err) {
      console.error("Error uploading logo:", err);
      showToast("Failed to upload logo", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = async (field: "logo_url" | "logo_login_url") => {
    setIsSaving(true);
    try {
      await updateAppSettings({ [field]: null });
      showToast("Logo removed", "success");
    } catch (err) {
      console.error("Error removing logo:", err);
      showToast("Failed to remove logo", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBrandNameChange = async (name: string) => {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await updateAppSettings({ brand_name: name.trim() });
      showToast("Brand name updated", "success");
    } catch (err) {
      console.error("Error updating brand name:", err);
      showToast("Failed to update brand name", "error");
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

      {/* Branding */}
      <Card>
        <CardContent className="p-6 space-y-6">
          <div>
            <p className="text-sm font-medium">Branding</p>
            <p className="text-xs text-muted-foreground">
              Customize the logo and brand name shown in the sidebar and login page.
            </p>
          </div>

          {/* Brand name */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Brand Name</label>
            <div className="flex gap-2">
              <Input
                defaultValue={settings.brand_name}
                placeholder="ITQ"
                className="max-w-xs"
                onBlur={(e) => {
                  if (e.target.value !== settings.brand_name) {
                    handleBrandNameChange(e.target.value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    (e.target as HTMLInputElement).blur();
                  }
                }}
              />
            </div>
          </div>

          {/* Sidebar logo */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Sidebar Logo</label>
            <div className="flex items-center gap-4">
              {settings.logo_url ? (
                <div className="flex items-center gap-3 rounded-md border border-border p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.logo_url} alt="Sidebar logo" className="h-8 object-contain" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLogo("logo_url")}
                    disabled={isSaving}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex h-16 w-32 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
              <div>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file, "logo_url");
                    e.target.value = "";
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploadingLogo}
                >
                  {isUploadingLogo ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-1 h-4 w-4" />
                  )}
                  Upload
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPEG, SVG, WebP. Max 512 KB.</p>
              </div>
            </div>
          </div>

          {/* Login page logo (optional) */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Login Page Logo (optional)</label>
            <p className="text-xs text-muted-foreground">
              Separate logo for the login page. Falls back to the sidebar logo if not set.
            </p>
            <div className="flex items-center gap-4">
              {settings.logo_login_url ? (
                <div className="flex items-center gap-3 rounded-md border border-border p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.logo_login_url} alt="Login logo" className="h-8 object-contain" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveLogo("logo_login_url")}
                    disabled={isSaving}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex h-16 w-32 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground">
                  <ImageIcon className="h-5 w-5" />
                </div>
              )}
              <div>
                <input
                  ref={loginLogoInputRef}
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleLogoUpload(file, "logo_login_url");
                    e.target.value = "";
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loginLogoInputRef.current?.click()}
                  disabled={isUploadingLoginLogo}
                >
                  {isUploadingLoginLogo ? (
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-1 h-4 w-4" />
                  )}
                  Upload
                </Button>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPEG, SVG, WebP. Max 512 KB.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                className={`inline-block h-4 w-4 rounded-full bg-white dark:bg-gray-200 transition-transform ${
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

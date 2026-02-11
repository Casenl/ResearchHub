"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Library,
  Plus,
  FolderOpen,
  Tags,
  Users,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Loader2,
  Grid3x3,
  FileText,
  ShieldCheck,
  Activity,
  BarChart3,
  KeyRound,
  ClipboardCheck,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ProtectedRoute } from "@/components/shared/protected-route";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title?: string;
  items: NavItem[];
  adminOnly?: boolean;
}

const navigation: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Research Library", href: "/research", icon: Library },
      { label: "New Research", href: "/research/new", icon: Plus },
      { label: "Context Library", href: "/context-library", icon: FolderOpen },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
  {
    title: "Configuration",
    adminOnly: true,
    items: [
      { label: "Prompts", href: "/admin/prompts", icon: FileText },
      { label: "Taxonomy", href: "/admin/taxonomy", icon: Tags },
    ],
  },
  {
    title: "Governance",
    adminOnly: true,
    items: [
      { label: "Context Rules", href: "/admin/context-rules", icon: ShieldCheck },
      { label: "Users", href: "/admin/users", icon: Users },
      { label: "API Keys", href: "/admin/api-keys", icon: KeyRound },
    ],
  },
  {
    title: "Oversight",
    adminOnly: true,
    items: [
      { label: "Review Queue", href: "/admin/review-queue", icon: ClipboardCheck },
      { label: "Coverage", href: "/admin/coverage", icon: Grid3x3 },
      { label: "Activity", href: "/admin/activity", icon: Activity },
      { label: "Usage & Cost", href: "/admin/usage", icon: BarChart3 },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, isLoading, signOut, isAdmin } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            "flex flex-col border-r border-border bg-background transition-all duration-300",
            isCollapsed ? "w-16" : "w-64"
          )}
        >
          {/* Logo Area */}
          <div className="flex h-16 items-center border-b border-border px-4">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-xl font-bold text-primary shrink-0">
                ITQ
              </span>
              {!isCollapsed && (
                <span className="text-xs text-muted-foreground truncate">
                  Market Intelligence
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-2 py-4">
            {navigation.map((section, sectionIdx) => {
              if (section.adminOnly && !isAdmin) return null;
              return (
                <div key={sectionIdx} className="mb-4">
                  {section.title && !isCollapsed && (
                    <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {section.title}
                    </p>
                  )}
                  {section.title && isCollapsed && (
                    <div className="mb-2 mx-3 border-t border-border" />
                  )}
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const active = isActive(item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                              active
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                              isCollapsed && "justify-center px-2"
                            )}
                            title={isCollapsed ? item.label : undefined}
                          >
                            <Icon className="h-5 w-5 shrink-0" />
                            {!isCollapsed && (
                              <span className="truncate">{item.label}</span>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </nav>

          {/* User + Collapse */}
          <div className="border-t border-border p-2 space-y-1">
            {/* User info */}
            {user && (
              <div
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2",
                  isCollapsed && "justify-center px-2"
                )}
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt=""
                    className="h-7 w-7 rounded-full shrink-0"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground shrink-0">
                    {(user.displayName ?? user.email ?? "?")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}
                {!isCollapsed && (
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {user.displayName ?? "User"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Sign out */}
            <button
              onClick={() => signOut()}
              className={cn(
                "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? "Sign out" : undefined}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!isCollapsed && <span>Sign out</span>}
            </button>

            {/* Collapse Toggle */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="flex w-full items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Header Bar */}
          <header className="flex h-16 items-center justify-between border-b border-border bg-background px-6">
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-muted-foreground">
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                Home
              </Link>
              {pathname !== "/" && (
                <>
                  <span className="mx-2">/</span>
                  <span className="text-foreground capitalize">
                    {pathname
                      .split("/")
                      .filter(Boolean)
                      .map((segment) => segment.replace(/-/g, " "))
                      .join(" / ")}
                  </span>
                </>
              )}
            </div>

            {/* User role badge */}
            {user && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground rounded-full border border-border px-2 py-0.5">
                  {user.role}
                </span>
              </div>
            )}
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

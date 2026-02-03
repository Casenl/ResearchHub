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
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Research Library", href: "/research", icon: Library },
      { label: "New Research", href: "/research/new", icon: Plus },
      { label: "Context Library", href: "/context-library", icon: FolderOpen },
    ],
  },
  {
    title: "Admin",
    items: [
      { label: "Taxonomy", href: "/admin/taxonomy", icon: Tags },
      { label: "Users", href: "/admin/users", icon: Users },
    ],
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-border bg-white transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo Area */}
        <div className="flex h-16 items-center border-b border-border px-4">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-xl font-bold text-primary shrink-0">ITQ</span>
            {!collapsed && (
              <span className="text-xs text-muted-foreground truncate">
                Market Intelligence
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          {navigation.map((section, sectionIdx) => (
            <div key={sectionIdx} className="mb-4">
              {section.title && !collapsed && (
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {section.title}
                </p>
              )}
              {section.title && collapsed && (
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
                          collapsed && "justify-center px-2"
                        )}
                        title={collapsed ? item.label : undefined}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-border p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
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
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-6">
          {/* Breadcrumbs Area */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
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

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

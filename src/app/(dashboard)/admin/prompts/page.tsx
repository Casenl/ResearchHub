"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { FileText, Brain, Grid3x3 } from "lucide-react";

import { cn } from "@/lib/utils";

import { TemplatesTab } from "./_components/templates-tab";
import { AIToolsTab } from "./_components/ai-tools-tab";
import { AssignmentsTab } from "./_components/assignments-tab";

// =============================================================================
// Tab Configuration
// =============================================================================

const TAB_CONFIG = [
  { value: "templates", label: "Base Templates", icon: FileText },
  { value: "tools", label: "AI Tools", icon: Brain },
  { value: "assignments", label: "Assignments", icon: Grid3x3 },
] as const;

// =============================================================================
// PromptsPage
// =============================================================================

export default function PromptsPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Prompt Template Manager
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage base templates, AI tool profiles, and domain-step assignments
        </p>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="templates">
        <Tabs.List className="flex border-b border-border">
          {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
            <Tabs.Trigger
              key={value}
              value={value}
              className={cn(
                "flex items-center gap-2 border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors",
                "hover:text-foreground",
                "data-[state=active]:border-primary data-[state=active]:text-primary"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <div className="mt-6">
          <Tabs.Content value="templates">
            <TemplatesTab />
          </Tabs.Content>
          <Tabs.Content value="tools">
            <AIToolsTab />
          </Tabs.Content>
          <Tabs.Content value="assignments">
            <AssignmentsTab />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}

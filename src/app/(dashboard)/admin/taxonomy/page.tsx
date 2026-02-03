"use client";

import * as Tabs from "@radix-ui/react-tabs";
import { Tags, Globe, Shield, Building2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { MarketsTab } from "./_components/markets-tab";
import { DomainsTab } from "./_components/domains-tab";
import { SectorsTab } from "./_components/sectors-tab";
import { TagsTab } from "./_components/tags-tab";

// =============================================================================
// Tab Configuration
// =============================================================================

const TAB_CONFIG = [
  { value: "markets", label: "Markets", icon: Globe },
  { value: "domains", label: "Domains", icon: Shield },
  { value: "sectors", label: "Sectors", icon: Building2 },
  { value: "tags", label: "Tags", icon: Tags },
] as const;

// =============================================================================
// TaxonomyPage
// =============================================================================

export default function TaxonomyPage(): React.JSX.Element {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Taxonomy Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage markets, domains, sectors, and tags used across the portal
        </p>
      </div>

      {/* Tabs */}
      <Tabs.Root defaultValue="markets">
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
          <Tabs.Content value="markets">
            <MarketsTab />
          </Tabs.Content>
          <Tabs.Content value="domains">
            <DomainsTab />
          </Tabs.Content>
          <Tabs.Content value="sectors">
            <SectorsTab />
          </Tabs.Content>
          <Tabs.Content value="tags">
            <TagsTab />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </div>
  );
}

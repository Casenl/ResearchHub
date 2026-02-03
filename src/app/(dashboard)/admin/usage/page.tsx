"use client";

import { useState } from "react";

import { UsageSummaryCards } from "./_components/usage-summary-cards";
import { UsageBreakdownTable } from "./_components/usage-breakdown-table";
import { UsageViewToggle } from "./_components/usage-view-toggle";

import type { UsageView } from "./_components/usage-view-toggle";

// =============================================================================
// Usage & Cost Tracking Page
// =============================================================================

export default function UsagePage(): React.JSX.Element {
  const [activeView, setActiveView] = useState<UsageView>("by-bu");

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Usage &amp; Cost Tracking
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor API token consumption and cost attribution across business
          units
        </p>
      </div>

      {/* Summary stat cards */}
      <UsageSummaryCards />

      {/* Breakdown section */}
      <div className="space-y-4">
        <UsageViewToggle activeView={activeView} onViewChange={setActiveView} />
        <UsageBreakdownTable view={activeView} />
      </div>
    </div>
  );
}

"use client";

import { useMemo } from "react";

import { DollarSign, Zap, BarChart3, TrendingUp } from "lucide-react";

import { Card, CardHeader, CardDescription, CardContent } from "@/components/ui/card";
import { useApiUsage } from "@/hooks/use-usage";
import { useAIToolProfiles } from "@/hooks/use-admin-data";

import { formatCurrency, formatNumber } from "./usage-formatters";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  description: string;
  accentClass: string;
}

function StatCard({ icon: Icon, label, value, description, accentClass }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription className="text-sm font-medium">{label}</CardDescription>
        <div className={`rounded-md p-2 ${accentClass}`}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

export function UsageSummaryCards(): React.JSX.Element {
  const { data: usageData } = useApiUsage();
  const { data: toolProfiles } = useAIToolProfiles();

  const stats = useMemo(() => {
    const totalCost = usageData.reduce((sum, e) => sum + e.estimated_cost, 0);
    const totalTokens = usageData.reduce(
      (sum, e) => sum + e.input_tokens + e.output_tokens,
      0,
    );
    const totalCalls = usageData.length;

    // Find most-used tool by call count
    const toolCounts = new Map<string, number>();
    for (const entry of usageData) {
      toolCounts.set(entry.ai_tool_id, (toolCounts.get(entry.ai_tool_id) ?? 0) + 1);
    }
    let topToolId = "";
    let topToolCount = 0;
    for (const [toolId, count] of toolCounts) {
      if (count > topToolCount) {
        topToolId = toolId;
        topToolCount = count;
      }
    }
    const topToolName =
      toolProfiles.find((t) => t.id === topToolId)?.name ?? topToolId;

    return { totalCost, totalTokens, totalCalls, topToolName, topToolCount };
  }, [usageData, toolProfiles]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        icon={DollarSign}
        label="Total Cost (this month)"
        value={formatCurrency(stats.totalCost)}
        description="Estimated across all AI tools"
        accentClass="bg-green-100 text-green-700"
      />
      <StatCard
        icon={Zap}
        label="Tokens Consumed"
        value={formatNumber(stats.totalTokens)}
        description="Input + output tokens combined"
        accentClass="bg-amber-100 text-amber-700"
      />
      <StatCard
        icon={BarChart3}
        label="API Calls"
        value={formatNumber(stats.totalCalls)}
        description="Total requests this month"
        accentClass="bg-blue-100 text-blue-700"
      />
      <StatCard
        icon={TrendingUp}
        label="Top AI Tool"
        value={stats.topToolName}
        description={`${stats.topToolCount} calls this month`}
        accentClass="bg-purple-100 text-purple-700"
      />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { COMPETITOR_TYPE_LABELS } from "@/lib/constants";
import { useMarkets } from "@/hooks/use-taxonomy";
import { useCreateCompetitor } from "@/hooks/use-competitors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

import type { CompetitorType } from "@/types";

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function NewCompetitorPage(): React.JSX.Element {
  const router = useRouter();
  const { createCompetitor, isCreating } = useCreateCompetitor();
  const { data: markets } = useMarkets();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [type, setType] = useState<CompetitorType | "">("");
  const [hqMarketId, setHqMarketId] = useState("");
  const [employeeRange, setEmployeeRange] = useState("");
  const [revenueRange, setRevenueRange] = useState("");
  const [foundedYear, setFoundedYear] = useState("");

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Please enter a competitor name.");
      return;
    }
    if (!type) {
      alert("Please select a competitor type.");
      return;
    }

    try {
      const id = await createCompetitor({
        name: name.trim(),
        description: description.trim(),
        website: website.trim(),
        logo_url: null,
        type,
        headquarters_market_id: hqMarketId,
        employee_range: employeeRange,
        revenue_range: revenueRange,
        founded_year: foundedYear ? parseInt(foundedYear, 10) : null,
        positions: [],
        events: [],
        tag_ids: [],
        created_by: "",
      });
      router.push(`/competitors/${id}`);
    } catch (error) {
      console.error("Failed to create competitor:", error);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Back Link */}
      <Link
        href="/competitors"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Competitors
      </Link>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add Competitor</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a new competitor profile to track their market positions and
          activities.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardContent className="space-y-4 p-5">
            <h2 className="text-sm font-semibold text-foreground">
              Basic Information
            </h2>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Company Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Computacenter"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of the competitor and their positioning..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Website
              </label>
              <Input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Competitor Type *
              </label>
              <div className="flex flex-wrap gap-2">
                {(
                  Object.entries(COMPETITOR_TYPE_LABELS) as [
                    CompetitorType,
                    string,
                  ][]
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setType(key)}
                    className={cn(
                      "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                      type === key
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Details */}
        <Card>
          <CardContent className="space-y-4 p-5">
            <h2 className="text-sm font-semibold text-foreground">
              Company Details
            </h2>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Headquarters Market
              </label>
              <select
                value={hqMarketId}
                onChange={(e) => setHqMarketId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">Select market...</option>
                {markets.map((market) => (
                  <option key={market.id} value={market.id}>
                    {market.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Employee Range
                </label>
                <Input
                  value={employeeRange}
                  onChange={(e) => setEmployeeRange(e.target.value)}
                  placeholder="e.g. 1000-5000"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Revenue Range
                </label>
                <Input
                  value={revenueRange}
                  onChange={(e) => setRevenueRange(e.target.value)}
                  placeholder="e.g. 100M-500M EUR"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Founded Year
                </label>
                <Input
                  type="number"
                  value={foundedYear}
                  onChange={(e) => setFoundedYear(e.target.value)}
                  placeholder="e.g. 1997"
                  min={1900}
                  max={2030}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/competitors">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isCreating}>
            {isCreating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            {isCreating ? "Creating..." : "Create Competitor"}
          </Button>
        </div>
      </form>
    </div>
  );
}

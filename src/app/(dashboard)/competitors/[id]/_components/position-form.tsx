"use client";

import React, { useState } from "react";
import { Loader2, Plus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { PACKAGING_MODEL_LABELS } from "@/lib/constants";
import { useMarkets, useDomains, useSectors } from "@/hooks/use-taxonomy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

import type { CompetitorPosition, PackagingModel } from "@/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface PositionFormProps {
  onSave: (position: Omit<CompetitorPosition, "id" | "updated_at" | "updated_by">) => Promise<void>;
  onCancel: () => void;
  initial?: CompetitorPosition;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PositionForm({
  onSave,
  onCancel,
  initial,
}: PositionFormProps): React.JSX.Element {
  const { data: markets } = useMarkets();
  const { data: domains } = useDomains();
  const { data: sectors } = useSectors();

  const [marketId, setMarketId] = useState(initial?.market_id ?? "");
  const [domainId, setDomainId] = useState(initial?.domain_id ?? "");
  const [sectorIds, setSectorIds] = useState<string[]>(
    initial?.sector_ids ?? []
  );
  const [services, setServices] = useState<string[]>(
    initial?.services ?? []
  );
  const [serviceInput, setServiceInput] = useState("");
  const [packagingModel, setPackagingModel] = useState<PackagingModel | "">(
    initial?.packaging_model ?? ""
  );
  const [vendorPartnerships, setVendorPartnerships] = useState<string[]>(
    initial?.vendor_partnerships ?? []
  );
  const [vendorInput, setVendorInput] = useState("");
  const [strengths, setStrengths] = useState(initial?.strengths ?? "");
  const [weaknesses, setWeaknesses] = useState(initial?.weaknesses ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const addService = (): void => {
    if (serviceInput.trim()) {
      setServices((prev) => [...prev, serviceInput.trim()]);
      setServiceInput("");
    }
  };

  const removeService = (index: number): void => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const addVendor = (): void => {
    if (vendorInput.trim()) {
      setVendorPartnerships((prev) => [...prev, vendorInput.trim()]);
      setVendorInput("");
    }
  };

  const removeVendor = (index: number): void => {
    setVendorPartnerships((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSector = (sectorId: string): void => {
    setSectorIds((prev) =>
      prev.includes(sectorId)
        ? prev.filter((s) => s !== sectorId)
        : [...prev, sectorId]
    );
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!marketId || !domainId || !packagingModel) {
      alert("Please fill in market, domain, and packaging model.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        market_id: marketId,
        domain_id: domainId,
        sector_ids: sectorIds,
        services,
        packaging_model: packagingModel,
        vendor_partnerships: vendorPartnerships,
        strengths,
        weaknesses,
        notes,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">
            {initial ? "Edit Position" : "Add Position"}
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Market */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Market *
              </label>
              <select
                value={marketId}
                onChange={(e) => setMarketId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">Select market...</option>
                {markets.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Domain */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Domain *
              </label>
              <select
                value={domainId}
                onChange={(e) => setDomainId(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
              >
                <option value="">Select domain...</option>
                {domains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sectors */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Target Sectors
            </label>
            <div className="flex flex-wrap gap-2">
              {sectors.map((sector) => (
                <button
                  key={sector.id}
                  type="button"
                  onClick={() => toggleSector(sector.id)}
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    sectorIds.includes(sector.id)
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {sector.name}
                </button>
              ))}
            </div>
          </div>

          {/* Packaging Model */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Packaging Model *
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                Object.entries(PACKAGING_MODEL_LABELS) as [
                  PackagingModel,
                  string,
                ][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPackagingModel(key)}
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    packagingModel === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Services
            </label>
            <div className="flex gap-2">
              <Input
                value={serviceInput}
                onChange={(e) => setServiceInput(e.target.value)}
                placeholder="Add a service..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addService();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addService}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {services.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {services.map((service, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-1 text-xs text-foreground"
                  >
                    {service}
                    <button
                      type="button"
                      onClick={() => removeService(i)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Vendor Partnerships */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Vendor Partnerships
            </label>
            <div className="flex gap-2">
              <Input
                value={vendorInput}
                onChange={(e) => setVendorInput(e.target.value)}
                placeholder="Add a vendor..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addVendor();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addVendor}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {vendorPartnerships.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {vendorPartnerships.map((vendor, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
                  >
                    {vendor}
                    <button
                      type="button"
                      onClick={() => removeVendor(i)}
                      className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Strengths
              </label>
              <Textarea
                value={strengths}
                onChange={(e) => setStrengths(e.target.value)}
                placeholder="Key strengths in this market/domain..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Weaknesses
              </label>
              <Textarea
                value={weaknesses}
                onChange={(e) => setWeaknesses(e.target.value)}
                placeholder="Key weaknesses or gaps..."
                rows={3}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initial ? "Update Position" : "Add Position"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

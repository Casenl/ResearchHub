"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { COMPETITOR_EVENT_TYPE_LABELS } from "@/lib/constants";
import { useMarkets, useDomains, useSectors } from "@/hooks/use-taxonomy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

import type { CompetitorEvent, CompetitorEventType } from "@/types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EventFormProps {
  onSave: (
    event: Omit<
      CompetitorEvent,
      "id" | "created_at" | "created_by" | "origin" | "agent_identity"
    >
  ) => Promise<void>;
  onCancel: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EventForm({
  onSave,
  onCancel,
}: EventFormProps): React.JSX.Element {
  const { data: markets } = useMarkets();
  const { data: domains } = useDomains();
  const { data: sectors } = useSectors();

  const [eventType, setEventType] = useState<CompetitorEventType | "">("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [marketIds, setMarketIds] = useState<string[]>([]);
  const [domainIds, setDomainIds] = useState<string[]>([]);
  const [sectorIds, setSectorIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const toggleId = (
    id: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ): void => {
    setter((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!eventType || !title.trim() || !date) {
      alert("Please fill in event type, title, and date.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        event_type: eventType,
        title: title.trim(),
        description: description.trim(),
        date,
        source_url: sourceUrl.trim(),
        market_ids: marketIds,
        domain_ids: domainIds,
        sector_ids: sectorIds,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Add Event</h3>

          {/* Event Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Event Type *
            </label>
            <div className="flex flex-wrap gap-2">
              {(
                Object.entries(COMPETITOR_EVENT_TYPE_LABELS) as [
                  CompetitorEventType,
                  string,
                ][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setEventType(key)}
                  className={cn(
                    "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    eventType === key
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Title & Date */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Title *
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Acquired SecureLink Netherlands"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Date *
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Details about this event..."
              rows={3}
            />
          </div>

          {/* Source URL */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Source URL
            </label>
            <Input
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/article"
            />
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Markets
              </label>
              <div className="flex flex-wrap gap-1.5">
                {markets.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleId(m.id, setMarketIds)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                      marketIds.includes(m.id)
                        ? "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Domains
              </label>
              <div className="flex flex-wrap gap-1.5">
                {domains.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => toggleId(d.id, setDomainIds)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                      domainIds.includes(d.id)
                        ? "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {d.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sectors
              </label>
              <div className="flex flex-wrap gap-1.5">
                {sectors.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleId(s.id, setSectorIds)}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                      sectorIds.includes(s.id)
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    )}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Event
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  Clock,
  ExternalLink,
  Bot,
  User,
  Rocket,
  Building2,
  Handshake,
  MapPin,
  LogOut,
  DollarSign,
  Award,
  UserCog,
  Landmark,
  CircleDot,
} from "lucide-react";

import { cn, formatDate, generateId } from "@/lib/utils";
import { COMPETITOR_EVENT_TYPE_LABELS, RESEARCH_ORIGIN_LABELS } from "@/lib/constants";
import { useMarkets, useDomains } from "@/hooks/use-taxonomy";
import { useUpdateCompetitor } from "@/hooks/use-competitors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";

import { EventForm } from "./event-form";

import type { Competitor, CompetitorEvent, CompetitorEventType } from "@/types";

// ---------------------------------------------------------------------------
// Event type icons
// ---------------------------------------------------------------------------

const EVENT_TYPE_ICONS: Record<CompetitorEventType, React.ElementType> = {
  service_launch: Rocket,
  acquisition: Building2,
  partnership: Handshake,
  market_entry: MapPin,
  market_exit: LogOut,
  pricing_change: DollarSign,
  certification: Award,
  leadership_change: UserCog,
  funding: Landmark,
  other: CircleDot,
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface TimelineTabProps {
  competitor: Competitor;
}

export function TimelineTab({
  competitor,
}: TimelineTabProps): React.JSX.Element {
  const { data: markets } = useMarkets();
  const { data: domains } = useDomains();
  const { updateCompetitor } = useUpdateCompetitor();

  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState<CompetitorEventType | "all">(
    "all"
  );

  // Sort events reverse-chronologically
  const sortedEvents = useMemo(() => {
    const events = [...competitor.events];
    events.sort((a, b) => b.date.localeCompare(a.date));

    if (typeFilter !== "all") {
      return events.filter((e) => e.event_type === typeFilter);
    }
    return events;
  }, [competitor.events, typeFilter]);

  const handleAddEvent = async (
    data: Omit<
      CompetitorEvent,
      "id" | "created_at" | "created_by" | "origin" | "agent_identity"
    >
  ): Promise<void> => {
    const newEvent: CompetitorEvent = {
      ...data,
      id: generateId(),
      origin: "human",
      agent_identity: null,
      created_at: new Date().toISOString(),
      created_by: "",
    };

    await updateCompetitor(competitor.id, {
      events: [...competitor.events, newEvent],
    });
    setShowForm(false);
  };

  const handleDeleteEvent = async (eventId: string): Promise<void> => {
    const updated = competitor.events.filter((e) => e.id !== eventId);
    await updateCompetitor(competitor.id, { events: updated });
  };

  const getMarketName = (id: string): string =>
    markets.find((m) => m.id === id)?.name ?? id;
  const getDomainName = (id: string): string =>
    domains.find((d) => d.id === id)?.name ?? id;

  return (
    <div className="mt-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Timeline ({competitor.events.length} events)
        </h3>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Add Event
          </Button>
        )}
      </div>

      {/* Type filter */}
      {competitor.events.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setTypeFilter("all")}
            className={cn(
              "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
              typeFilter === "all"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            )}
          >
            All
          </button>
          {(
            Object.entries(COMPETITOR_EVENT_TYPE_LABELS) as [
              CompetitorEventType,
              string,
            ][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              className={cn(
                "rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
                typeFilter === key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Add Form */}
      {showForm && (
        <EventForm
          onSave={handleAddEvent}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Timeline Events */}
      {sortedEvents.length > 0 ? (
        <div className="relative space-y-0">
          {/* Timeline line */}
          <div className="absolute left-5 top-0 h-full w-px bg-border" />

          {sortedEvents.map((event) => {
            const Icon = EVENT_TYPE_ICONS[event.event_type];
            return (
              <div key={event.id} className="relative flex gap-4 pb-6">
                {/* Icon */}
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-card border border-border">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Content */}
                <div className="flex-1 rounded-lg border border-border bg-card p-4">
                  <div className="mb-1 flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        {event.title}
                      </h4>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(event.date)}
                        </span>
                        <Badge className="px-1.5 py-0 text-[10px] bg-muted text-foreground">
                          {COMPETITOR_EVENT_TYPE_LABELS[event.event_type]}
                        </Badge>
                        {/* Origin badge */}
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-1.5 py-0 text-[10px] font-medium",
                            event.origin === "agent"
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-200"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {event.origin === "agent" ? (
                            <Bot className="h-2.5 w-2.5" />
                          ) : (
                            <User className="h-2.5 w-2.5" />
                          )}
                          {RESEARCH_ORIGIN_LABELS[event.origin]}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteEvent(event.id)}
                    >
                      Delete
                    </Button>
                  </div>

                  {event.description && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {event.description}
                    </p>
                  )}

                  {/* Dimension badges */}
                  {(event.market_ids.length > 0 ||
                    event.domain_ids.length > 0) && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {event.market_ids.map((id) => (
                        <Badge
                          key={id}
                          className="px-1.5 py-0 text-[10px] bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-200"
                        >
                          {getMarketName(id)}
                        </Badge>
                      ))}
                      {event.domain_ids.map((id) => (
                        <Badge
                          key={id}
                          className="px-1.5 py-0 text-[10px] bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-200"
                        >
                          {getDomainName(id)}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Source link */}
                  {event.source_url && (
                    <a
                      href={event.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Source
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        !showForm && (
          <EmptyState
            icon={Clock}
            title="No events recorded"
            description="Add timeline events to track this competitor's activities, launches, partnerships, and market moves."
            action={
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Add First Event
              </Button>
            }
          />
        )
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Plus, MapPin } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { generateId } from "@/lib/utils";
import { PACKAGING_MODEL_LABELS } from "@/lib/constants";
import { useMarkets, useDomains, useSectors } from "@/hooks/use-taxonomy";
import { useUpdateCompetitor } from "@/hooks/use-competitors";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

import { PositionForm } from "./position-form";

import type { Competitor, CompetitorPosition } from "@/types";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface PositionsTabProps {
  competitor: Competitor;
}

export function PositionsTab({
  competitor,
}: PositionsTabProps): React.JSX.Element {
  const { data: markets } = useMarkets();
  const { data: domains } = useDomains();
  const { data: sectors } = useSectors();
  const { updateCompetitor } = useUpdateCompetitor();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddPosition = async (
    data: Omit<CompetitorPosition, "id" | "updated_at" | "updated_by">
  ): Promise<void> => {
    const newPosition: CompetitorPosition = {
      ...data,
      id: generateId(),
      updated_at: new Date().toISOString(),
      updated_by: "",
    };

    await updateCompetitor(competitor.id, {
      positions: [...competitor.positions, newPosition],
    });
    setShowForm(false);
  };

  const handleEditPosition = async (
    data: Omit<CompetitorPosition, "id" | "updated_at" | "updated_by">
  ): Promise<void> => {
    const updatedPositions = competitor.positions.map((p) =>
      p.id === editingId
        ? {
            ...data,
            id: p.id,
            updated_at: new Date().toISOString(),
            updated_by: "",
          }
        : p
    );

    await updateCompetitor(competitor.id, { positions: updatedPositions });
    setEditingId(null);
  };

  const handleDeletePosition = async (positionId: string): Promise<void> => {
    const updatedPositions = competitor.positions.filter(
      (p) => p.id !== positionId
    );
    await updateCompetitor(competitor.id, { positions: updatedPositions });
  };

  const getMarketName = (id: string): string =>
    markets.find((m) => m.id === id)?.name ?? id;
  const getDomainName = (id: string): string =>
    domains.find((d) => d.id === id)?.name ?? id;
  const getSectorName = (id: string): string =>
    sectors.find((s) => s.id === id)?.name ?? id;

  return (
    <div className="mt-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">
          Competitive Positions ({competitor.positions.length})
        </h3>
        {!showForm && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="mr-1 h-4 w-4" />
            Add Position
          </Button>
        )}
      </div>

      {/* Add Form */}
      {showForm && (
        <PositionForm
          onSave={handleAddPosition}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Position Cards */}
      {competitor.positions.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {competitor.positions.map((position) =>
            editingId === position.id ? (
              <PositionForm
                key={position.id}
                initial={position}
                onSave={handleEditPosition}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <Card key={position.id}>
                <CardContent className="p-5">
                  {/* Header: Market x Domain */}
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        {getMarketName(position.market_id)} &times;{" "}
                        {getDomainName(position.domain_id)}
                      </h4>
                      <Badge className="mt-1 px-2 py-0.5 text-xs bg-muted text-foreground">
                        {PACKAGING_MODEL_LABELS[position.packaging_model]}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(position.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeletePosition(position.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* Sectors */}
                  {position.sector_ids.length > 0 && (
                    <div className="mb-3 flex flex-wrap gap-1">
                      {position.sector_ids.map((sid) => (
                        <Badge
                          key={sid}
                          className="px-2 py-0.5 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
                        >
                          {getSectorName(sid)}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Services */}
                  {position.services.length > 0 && (
                    <div className="mb-3">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        Services
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {position.services.map((s, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-muted px-2 py-0.5 text-xs text-foreground"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vendors */}
                  {position.vendor_partnerships.length > 0 && (
                    <div className="mb-3">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        Vendor Partnerships
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {position.vendor_partnerships.map((v) => (
                          <Badge
                            key={v}
                            className="px-2 py-0.5 text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200"
                          >
                            {v}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths & Weaknesses */}
                  <div className="grid grid-cols-2 gap-3">
                    {position.strengths && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                          Strengths
                        </p>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-muted-foreground">
                          <ReactMarkdown>{position.strengths}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                    {position.weaknesses && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-red-700 dark:text-red-300">
                          Weaknesses
                        </p>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-xs text-muted-foreground">
                          <ReactMarkdown>{position.weaknesses}</ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      ) : (
        !showForm && (
          <EmptyState
            icon={MapPin}
            title="No positions tracked"
            description="Add competitive positions to track this competitor's presence across markets and domains."
            action={
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus className="mr-1 h-4 w-4" />
                Add First Position
              </Button>
            }
          />
        )
      )}
    </div>
  );
}

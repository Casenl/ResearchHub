"use client";

import { useMemo } from "react";

import { MARKETS } from "@/data/markets";
import { DOMAINS } from "@/data/domains";
import { MOCK_RESEARCH } from "@/data/mock-research";

import { getCellKey } from "./coverage-grid";

import type { Market, Research } from "@/types";
import type { CoverageCellData, MarketGroup } from "./coverage-grid";
import type { CoverageCellStatus } from "./coverage-cell";

// =============================================================================
// Constants
// =============================================================================

const STALE_THRESHOLD_DAYS = 180;

// =============================================================================
// Market hierarchy helpers
// =============================================================================

/** Markets that have no children are leaf-level. */
function getLeafMarkets(): Market[] {
  const parentIds = new Set(
    MARKETS.filter((m) => m.parent_id !== null).map((m) => m.parent_id)
  );
  return MARKETS.filter((m) => !parentIds.has(m.id));
}

/** Group leaf markets by their direct parent region. */
function buildMarketGroups(leafMarkets: Market[]): MarketGroup[] {
  const groupMap = new Map<string, MarketGroup>();

  for (const leaf of leafMarkets) {
    const region = leaf.parent_id
      ? MARKETS.find((m) => m.id === leaf.parent_id)
      : leaf;
    if (!region) continue;

    const existing = groupMap.get(region.id);
    if (existing) {
      existing.leafMarkets.push(leaf);
    } else {
      groupMap.set(region.id, { region, leafMarkets: [leaf] });
    }
  }

  return Array.from(groupMap.values());
}

/** Get all ancestor market IDs for a leaf, including itself. */
function getAncestorIds(marketId: string): string[] {
  const ids: string[] = [marketId];
  let current = MARKETS.find((m) => m.id === marketId);
  while (current?.parent_id) {
    ids.push(current.parent_id);
    current = MARKETS.find((m) => m.id === current!.parent_id);
  }
  return ids;
}

// =============================================================================
// Research matching helpers
// =============================================================================

/** True if research covers this leaf market (directly or via an ancestor). */
function researchCoversMarket(research: Research, leafId: string): boolean {
  const ancestors = getAncestorIds(leafId);
  return research.dimensions.markets.some((m) => ancestors.includes(m.id));
}

/** True if research is relevant to the selected sector (cross-sector counts). */
function researchMatchesSector(
  research: Research,
  sectorId: string | null
): boolean {
  if (!sectorId) return true;
  if (research.dimensions.sectors.length === 0) return true;
  return research.dimensions.sectors.some((s) => s.id === sectorId);
}

/** Determine the best status for a set of research items covering one cell. */
function determineCellStatus(
  items: Research[],
  now: Date
): { status: CoverageCellStatus; newestPublishedAt: string | null } {
  let newestPublishedAt: string | null = null;
  let hasFresh = false;
  let hasStale = false;
  let hasInProgress = false;

  for (const item of items) {
    if (item.status === "archived") continue;

    if (
      item.status === "draft" ||
      item.status === "in_progress" ||
      item.status === "review"
    ) {
      hasInProgress = true;
    }

    if (item.status === "published" && item.published_at) {
      const pubDate = new Date(item.published_at);
      const daysDiff = Math.floor(
        (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (!newestPublishedAt || pubDate > new Date(newestPublishedAt)) {
        newestPublishedAt = item.published_at;
      }

      if (daysDiff <= STALE_THRESHOLD_DAYS) {
        hasFresh = true;
      } else {
        hasStale = true;
      }
    }
  }

  if (hasFresh) return { status: "fresh", newestPublishedAt };
  if (hasInProgress) return { status: "in_progress", newestPublishedAt };
  if (hasStale) return { status: "stale", newestPublishedAt };
  return { status: "empty", newestPublishedAt: null };
}

// =============================================================================
// Hook
// =============================================================================

interface UseCoverageDataResult {
  leafMarkets: Market[];
  marketGroups: MarketGroup[];
  cellData: Map<string, CoverageCellData>;
  allStatuses: CoverageCellStatus[];
}

export function useCoverageData(
  selectedSectorId: string | null
): UseCoverageDataResult {
  const leafMarkets = useMemo(() => getLeafMarkets(), []);
  const marketGroups = useMemo(
    () => buildMarketGroups(leafMarkets),
    [leafMarkets]
  );

  const cellData = useMemo(() => {
    const now = new Date();
    const dataMap = new Map<string, CoverageCellData>();

    for (const leaf of leafMarkets) {
      for (const domain of DOMAINS) {
        const matching = MOCK_RESEARCH.filter(
          (r) =>
            researchCoversMarket(r, leaf.id) &&
            r.dimensions.domains.some((d) => d.id === domain.id) &&
            researchMatchesSector(r, selectedSectorId)
        );

        const nonArchived = matching.filter((r) => r.status !== "archived");
        const { status, newestPublishedAt } = determineCellStatus(
          matching,
          now
        );

        dataMap.set(getCellKey(leaf.id, domain.id), {
          marketId: leaf.id,
          domainId: domain.id,
          status,
          researchCount: nonArchived.length,
          newestPublishedAt,
        });
      }
    }

    return dataMap;
  }, [leafMarkets, selectedSectorId]);

  const allStatuses = useMemo(
    () => Array.from(cellData.values()).map((c) => c.status),
    [cellData]
  );

  return { leafMarkets, marketGroups, cellData, allStatuses };
}

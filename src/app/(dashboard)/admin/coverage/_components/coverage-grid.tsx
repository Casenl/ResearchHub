"use client";

import { Fragment } from "react";

import { cn } from "@/lib/utils";

import { CoverageCell } from "./coverage-cell";

import type { Market, Domain } from "@/types";
import type { CoverageCellStatus } from "./coverage-cell";

// =============================================================================
// Types
// =============================================================================

export interface CoverageCellData {
  marketId: string;
  domainId: string;
  status: CoverageCellStatus;
  researchCount: number;
  newestPublishedAt: string | null;
}

export interface MarketGroup {
  region: Market;
  leafMarkets: Market[];
}

interface CoverageGridProps {
  marketGroups: MarketGroup[];
  domains: Domain[];
  cellData: Map<string, CoverageCellData>;
}

// =============================================================================
// Helpers
// =============================================================================

export function getCellKey(marketId: string, domainId: string): string {
  return `${marketId}::${domainId}`;
}

function computeDomainCoverage(
  marketGroups: MarketGroup[],
  domain: Domain,
  cellData: Map<string, CoverageCellData>
): number {
  let covered = 0;
  let total = 0;
  for (const group of marketGroups) {
    for (const market of group.leafMarkets) {
      total++;
      const cell = cellData.get(getCellKey(market.id, domain.id));
      if (cell && cell.status !== "empty") covered++;
    }
  }
  return total > 0 ? Math.round((covered / total) * 100) : 0;
}

function computeMarketCoverage(
  market: Market,
  domains: Domain[],
  cellData: Map<string, CoverageCellData>
): number {
  let covered = 0;
  for (const domain of domains) {
    const cell = cellData.get(getCellKey(market.id, domain.id));
    if (cell && cell.status !== "empty") covered++;
  }
  return domains.length > 0 ? Math.round((covered / domains.length) * 100) : 0;
}

// =============================================================================
// CoverageGrid
// =============================================================================

export function CoverageGrid({
  marketGroups,
  domains,
  cellData,
}: CoverageGridProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-background">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="sticky left-0 z-10 bg-background px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Market
            </th>
            {domains.map((domain) => (
              <th
                key={domain.id}
                className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                <div>{domain.name}</div>
                <div className="mt-1 text-[10px] font-normal text-muted-foreground/70">
                  {computeDomainCoverage(marketGroups, domain, cellData)}%
                  covered
                </div>
              </th>
            ))}
            <th className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Coverage
            </th>
          </tr>
        </thead>
        <tbody>
          {marketGroups.map((group) => (
            <Fragment key={group.region.id}>
              {/* Region header row */}
              <tr>
                <td
                  colSpan={domains.length + 2}
                  className="bg-muted/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  {group.region.name}
                </td>
              </tr>

              {/* Leaf market rows */}
              {group.leafMarkets.map((market) => {
                const coverage = computeMarketCoverage(
                  market,
                  domains,
                  cellData
                );
                return (
                  <tr
                    key={market.id}
                    className="border-b border-border/50 transition-colors hover:bg-muted/20"
                  >
                    <td className="sticky left-0 z-10 bg-background px-4 py-2.5 text-sm font-medium">
                      <span className="mr-2 text-muted-foreground">
                        {market.code}
                      </span>
                      {market.name}
                    </td>
                    {domains.map((domain) => {
                      const key = getCellKey(market.id, domain.id);
                      const cell = cellData.get(key);
                      return (
                        <td key={domain.id} className="px-3 py-2.5">
                          <CoverageCell
                            status={cell?.status ?? "empty"}
                            researchCount={cell?.researchCount ?? 0}
                            newestPublishedAt={
                              cell?.newestPublishedAt ?? null
                            }
                          />
                        </td>
                      );
                    })}
                    <td className="px-3 py-2.5 text-center">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          coverage === 100 && "text-green-600",
                          coverage > 0 && coverage < 100 && "text-amber-600",
                          coverage === 0 && "text-red-600"
                        )}
                      >
                        {coverage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

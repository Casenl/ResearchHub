"use client";

/**
 * Hooks for taxonomy data (markets, domains, sectors, tags).
 * Falls back to seed data during loading for seamless UX.
 */

import { useState, useEffect, useCallback } from "react";

import {
  subscribeMarkets,
  subscribeDomains,
  subscribeSectors,
  subscribeTags,
  saveMarkets,
  saveDomains,
  saveSectors,
  saveTags,
} from "@/lib/firestore/taxonomy";

import { MARKETS } from "@/data/markets";
import { DOMAINS } from "@/data/domains";
import { SECTORS } from "@/data/sectors";
import { SYSTEM_TAGS } from "@/data/tags";

import type { Market, Domain, Sector, Tag } from "@/types";

// -----------------------------------------------------------------------------
// Generic taxonomy hook factory
// -----------------------------------------------------------------------------

interface UseTaxonomyResult<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
  save: (items: T[]) => Promise<void>;
}

function useTaxonomy<T>(
  subscribeFn: (
    onData: (items: T[]) => void,
    onError: (error: Error) => void
  ) => () => void,
  saveFn: (items: T[]) => Promise<void>,
  fallbackData: T[]
): UseTaxonomyResult<T> {
  const [data, setData] = useState<T[]>(fallbackData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeFn(
      (items) => {
        setData(items.length > 0 ? items : fallbackData);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [subscribeFn, fallbackData]);

  const save = useCallback(
    async (items: T[]) => {
      try {
        await saveFn(items);
      } catch (err) {
        console.error("Error saving taxonomy:", err);
        throw err;
      }
    },
    [saveFn]
  );

  return { data, isLoading, error, save };
}

// -----------------------------------------------------------------------------
// Concrete taxonomy hooks
// -----------------------------------------------------------------------------

export function useMarkets(): UseTaxonomyResult<Market> {
  return useTaxonomy(subscribeMarkets, saveMarkets, MARKETS);
}

export function useDomains(): UseTaxonomyResult<Domain> {
  return useTaxonomy(subscribeDomains, saveDomains, DOMAINS);
}

export function useSectors(): UseTaxonomyResult<Sector> {
  return useTaxonomy(subscribeSectors, saveSectors, SECTORS);
}

export function useTags(): UseTaxonomyResult<Tag> {
  return useTaxonomy(subscribeTags, saveTags, SYSTEM_TAGS);
}

// -----------------------------------------------------------------------------
// Lookup helpers
// -----------------------------------------------------------------------------

export function useMarketById(
  markets: Market[],
  id: string
): Market | undefined {
  return markets.find((m) => m.id === id);
}

export function useDomainById(
  domains: Domain[],
  id: string
): Domain | undefined {
  return domains.find((d) => d.id === id);
}

export function useSectorById(
  sectors: Sector[],
  id: string
): Sector | undefined {
  return sectors.find((s) => s.id === id);
}

export function useChildMarkets(markets: Market[], parentId: string): Market[] {
  return markets.filter((m) => m.parent_id === parentId);
}

export function useRootMarkets(markets: Market[]): Market[] {
  return markets.filter((m) => m.parent_id === null);
}

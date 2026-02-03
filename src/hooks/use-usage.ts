"use client";

/**
 * Hook for API Usage entries.
 * Falls back to seed data during loading.
 */

import { useState, useEffect, useCallback } from "react";

import {
  subscribeApiUsage,
  writeApiUsageEntry,
} from "@/lib/firestore/usage";

import { MOCK_API_USAGE } from "@/data/mock-usage";

import type { ApiUsageEntry } from "@/types";

interface UseApiUsageResult {
  data: ApiUsageEntry[];
  isLoading: boolean;
  error: string | null;
  logUsage: (
    entry: Omit<ApiUsageEntry, "id" | "timestamp">
  ) => Promise<string>;
}

export function useApiUsage(maxEntries?: number): UseApiUsageResult {
  const [data, setData] = useState<ApiUsageEntry[]>(MOCK_API_USAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeApiUsage(
      (items) => {
        setData(items.length > 0 ? items : MOCK_API_USAGE);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      },
      maxEntries
    );

    return unsubscribe;
  }, [maxEntries]);

  const logUsage = useCallback(
    async (
      entry: Omit<ApiUsageEntry, "id" | "timestamp">
    ): Promise<string> => {
      return writeApiUsageEntry(entry);
    },
    []
  );

  return { data, isLoading, error, logUsage };
}

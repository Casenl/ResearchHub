"use client";

/**
 * Hook for Activity Log entries.
 * Falls back to seed data during loading.
 */

import { useState, useEffect, useCallback } from "react";

import {
  subscribeActivityLog,
  writeActivityLogEntry,
} from "@/lib/firestore/activity";

import { MOCK_ACTIVITY_LOG } from "@/data/mock-activity";

import type { ActivityLogEntry } from "@/types";

interface UseActivityLogResult {
  data: ActivityLogEntry[];
  isLoading: boolean;
  error: string | null;
  logActivity: (
    entry: Omit<ActivityLogEntry, "id" | "timestamp">
  ) => Promise<string>;
}

export function useActivityLog(maxEntries?: number): UseActivityLogResult {
  const [data, setData] = useState<ActivityLogEntry[]>(MOCK_ACTIVITY_LOG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeActivityLog(
      (items) => {
        setData(items.length > 0 ? items : MOCK_ACTIVITY_LOG);
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

  const logActivity = useCallback(
    async (
      entry: Omit<ActivityLogEntry, "id" | "timestamp">
    ): Promise<string> => {
      return writeActivityLogEntry(entry);
    },
    []
  );

  return { data, isLoading, error, logActivity };
}

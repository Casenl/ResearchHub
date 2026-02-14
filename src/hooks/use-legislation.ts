"use client";

/**
 * Hooks for Legislation.
 * Falls back to mock data during loading.
 */

import { useState, useEffect, useCallback, useMemo } from "react";

import {
  subscribeLegislation,
  subscribeLegislationById,
  subscribeLegislationByDimensions,
  createLegislation as createService,
  updateLegislation as updateService,
  deleteLegislation as deleteService,
} from "@/lib/firestore/legislation";

import { MOCK_LEGISLATION } from "@/data/mock-legislation";

import type { Legislation } from "@/types";

// -----------------------------------------------------------------------------
// List hook
// -----------------------------------------------------------------------------

interface UseLegislationResult {
  data: Legislation[];
  isLoading: boolean;
  error: string | null;
}

export function useLegislation(): UseLegislationResult {
  const [data, setData] = useState<Legislation[]>(MOCK_LEGISLATION);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeLegislation(
      (items) => {
        setData(items.length > 0 ? items : MOCK_LEGISLATION);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { data, isLoading, error };
}

// -----------------------------------------------------------------------------
// Single document hook
// -----------------------------------------------------------------------------

interface UseLegislationByIdResult {
  data: Legislation | null;
  isLoading: boolean;
  error: string | null;
}

export function useLegislationById(
  id: string | undefined
): UseLegislationByIdResult {
  const mockItem = id
    ? (MOCK_LEGISLATION.find((l) => l.id === id) ?? null)
    : null;
  const [data, setData] = useState<Legislation | null>(mockItem);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fallback = MOCK_LEGISLATION.find((l) => l.id === id) ?? null;

    const unsubscribe = subscribeLegislationById(
      id,
      (item) => {
        setData(item ?? fallback);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [id]);

  if (!id) {
    return { data: null, isLoading: false, error: null };
  }

  return { data, isLoading, error };
}

// -----------------------------------------------------------------------------
// Dimension-based hook (for wizard auto-suggest)
// -----------------------------------------------------------------------------

interface UseLegislationByDimensionsResult {
  data: Legislation[];
  isLoading: boolean;
  error: string | null;
}

export function useLegislationByDimensions(
  marketIds: string[],
  sectorIds: string[]
): UseLegislationByDimensionsResult {
  const marketKey = useMemo(() => marketIds.join(","), [marketIds]);
  const sectorKey = useMemo(() => sectorIds.join(","), [sectorIds]);
  const hasSelection = marketIds.length > 0 || sectorIds.length > 0;

  const [data, setData] = useState<Legislation[]>([]);
  const [isLoading, setIsLoading] = useState(hasSelection);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasSelection) {
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeLegislationByDimensions(
      marketIds,
      sectorIds,
      (items) => {
        setData(items);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marketKey, sectorKey, hasSelection]);

  if (!hasSelection) {
    return { data: [], isLoading: false, error: null };
  }

  return { data, isLoading, error };
}

// -----------------------------------------------------------------------------
// Mutation hooks
// -----------------------------------------------------------------------------

interface UseCreateLegislationResult {
  createLegislation: (
    data: Omit<Legislation, "id" | "created_at" | "updated_at">
  ) => Promise<string>;
  isCreating: boolean;
  error: string | null;
}

export function useCreateLegislation(): UseCreateLegislationResult {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createLegislation = useCallback(
    async (
      data: Omit<Legislation, "id" | "created_at" | "updated_at">
    ): Promise<string> => {
      try {
        setIsCreating(true);
        setError(null);
        const id = await createService(data);
        return id;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create legislation";
        setError(message);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return { createLegislation, isCreating, error };
}

interface UseUpdateLegislationResult {
  updateLegislation: (
    id: string,
    data: Partial<Omit<Legislation, "id">>
  ) => Promise<void>;
  isUpdating: boolean;
  error: string | null;
}

export function useUpdateLegislation(): UseUpdateLegislationResult {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLegislation = useCallback(
    async (
      id: string,
      data: Partial<Omit<Legislation, "id">>
    ): Promise<void> => {
      try {
        setIsUpdating(true);
        setError(null);
        await updateService(id, data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update legislation";
        setError(message);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return { updateLegislation, isUpdating, error };
}

interface UseDeleteLegislationResult {
  deleteLegislation: (id: string) => Promise<void>;
  isDeleting: boolean;
  error: string | null;
}

export function useDeleteLegislation(): UseDeleteLegislationResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteLegislation = useCallback(async (id: string): Promise<void> => {
    try {
      setIsDeleting(true);
      setError(null);
      await deleteService(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete legislation";
      setError(message);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteLegislation, isDeleting, error };
}

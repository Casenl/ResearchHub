"use client";

/**
 * Hooks for Competitors.
 * Falls back to mock data during loading.
 */

import { useState, useEffect, useCallback } from "react";

import {
  subscribeCompetitors,
  subscribeCompetitorById,
  createCompetitor as createService,
  updateCompetitor as updateService,
  deleteCompetitor as deleteService,
} from "@/lib/firestore/competitors";

import { MOCK_COMPETITORS } from "@/data/mock-competitors";

import type { Competitor } from "@/types";

// -----------------------------------------------------------------------------
// List hook
// -----------------------------------------------------------------------------

interface UseCompetitorsResult {
  data: Competitor[];
  isLoading: boolean;
  error: string | null;
}

export function useCompetitors(): UseCompetitorsResult {
  const [data, setData] = useState<Competitor[]>(MOCK_COMPETITORS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeCompetitors(
      (items) => {
        setData(items.length > 0 ? items : MOCK_COMPETITORS);
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

interface UseCompetitorByIdResult {
  data: Competitor | null;
  isLoading: boolean;
  error: string | null;
}

export function useCompetitorById(
  id: string | undefined
): UseCompetitorByIdResult {
  const mockItem = id
    ? (MOCK_COMPETITORS.find((c) => c.id === id) ?? null)
    : null;
  const [data, setData] = useState<Competitor | null>(mockItem);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fallback = MOCK_COMPETITORS.find((c) => c.id === id) ?? null;

    const unsubscribe = subscribeCompetitorById(
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
// Mutation hooks
// -----------------------------------------------------------------------------

interface UseCreateCompetitorResult {
  createCompetitor: (
    data: Omit<Competitor, "id" | "created_at" | "updated_at">
  ) => Promise<string>;
  isCreating: boolean;
  error: string | null;
}

export function useCreateCompetitor(): UseCreateCompetitorResult {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCompetitor = useCallback(
    async (
      data: Omit<Competitor, "id" | "created_at" | "updated_at">
    ): Promise<string> => {
      try {
        setIsCreating(true);
        setError(null);
        const id = await createService(data);
        return id;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create competitor";
        setError(message);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return { createCompetitor, isCreating, error };
}

interface UseUpdateCompetitorResult {
  updateCompetitor: (
    id: string,
    data: Partial<Omit<Competitor, "id">>
  ) => Promise<void>;
  isUpdating: boolean;
  error: string | null;
}

export function useUpdateCompetitor(): UseUpdateCompetitorResult {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCompetitor = useCallback(
    async (
      id: string,
      data: Partial<Omit<Competitor, "id">>
    ): Promise<void> => {
      try {
        setIsUpdating(true);
        setError(null);
        await updateService(id, data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update competitor";
        setError(message);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return { updateCompetitor, isUpdating, error };
}

interface UseDeleteCompetitorResult {
  deleteCompetitor: (id: string) => Promise<void>;
  isDeleting: boolean;
  error: string | null;
}

export function useDeleteCompetitor(): UseDeleteCompetitorResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCompetitor = useCallback(async (id: string): Promise<void> => {
    try {
      setIsDeleting(true);
      setError(null);
      await deleteService(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete competitor";
      setError(message);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteCompetitor, isDeleting, error };
}

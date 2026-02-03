"use client";

/**
 * Hooks for Research documents.
 * Falls back to seed data during loading.
 */

import { useState, useEffect, useCallback } from "react";

import {
  subscribeResearchList,
  subscribeResearchById,
  createResearch as createResearchService,
  updateResearch as updateResearchService,
  deleteResearch as deleteResearchService,
} from "@/lib/firestore/research";

import { MOCK_RESEARCH } from "@/data/mock-research";

import type { Research } from "@/types";

// -----------------------------------------------------------------------------
// List hook
// -----------------------------------------------------------------------------

interface UseResearchListResult {
  data: Research[];
  isLoading: boolean;
  error: string | null;
}

export function useResearchList(): UseResearchListResult {
  const [data, setData] = useState<Research[]>(MOCK_RESEARCH);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeResearchList(
      (items) => {
        setData(items.length > 0 ? items : MOCK_RESEARCH);
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

interface UseResearchByIdResult {
  data: Research | null;
  isLoading: boolean;
  error: string | null;
}

export function useResearchById(
  id: string | undefined
): UseResearchByIdResult {
  const [data, setData] = useState<Research | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setIsLoading(false);
      return;
    }

    // Set fallback from mock data while loading
    const mockItem = MOCK_RESEARCH.find((r) => r.id === id) ?? null;
    setData(mockItem);

    const unsubscribe = subscribeResearchById(
      id,
      (item) => {
        setData(item ?? mockItem);
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

  return { data, isLoading, error };
}

// -----------------------------------------------------------------------------
// Mutation hooks
// -----------------------------------------------------------------------------

interface UseCreateResearchResult {
  createResearch: (
    data: Omit<Research, "id" | "created_at" | "updated_at">
  ) => Promise<string>;
  isCreating: boolean;
  error: string | null;
}

export function useCreateResearch(): UseCreateResearchResult {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createResearch = useCallback(
    async (
      data: Omit<Research, "id" | "created_at" | "updated_at">
    ): Promise<string> => {
      try {
        setIsCreating(true);
        setError(null);
        const id = await createResearchService(data);
        return id;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to create research";
        setError(message);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return { createResearch, isCreating, error };
}

interface UseUpdateResearchResult {
  updateResearch: (
    id: string,
    data: Partial<Omit<Research, "id" | "created_at">>
  ) => Promise<void>;
  isUpdating: boolean;
  error: string | null;
}

export function useUpdateResearch(): UseUpdateResearchResult {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateResearch = useCallback(
    async (
      id: string,
      data: Partial<Omit<Research, "id" | "created_at">>
    ): Promise<void> => {
      try {
        setIsUpdating(true);
        setError(null);
        await updateResearchService(id, data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update research";
        setError(message);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return { updateResearch, isUpdating, error };
}

interface UseDeleteResearchResult {
  deleteResearch: (id: string) => Promise<void>;
  isDeleting: boolean;
  error: string | null;
}

export function useDeleteResearch(): UseDeleteResearchResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteResearch = useCallback(async (id: string): Promise<void> => {
    try {
      setIsDeleting(true);
      setError(null);
      await deleteResearchService(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete research";
      setError(message);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteResearch, isDeleting, error };
}

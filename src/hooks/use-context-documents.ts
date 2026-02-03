"use client";

/**
 * Hooks for Context Documents.
 * Falls back to seed data during loading.
 */

import { useState, useEffect, useCallback } from "react";

import {
  subscribeContextDocuments,
  subscribeContextDocumentById,
  createContextDocument as createService,
  updateContextDocument as updateService,
  deleteContextDocument as deleteService,
} from "@/lib/firestore/context-documents";

import { MOCK_CONTEXT_DOCUMENTS } from "@/data/mock-context-documents";

import type { ContextDocument } from "@/types";

// -----------------------------------------------------------------------------
// List hook
// -----------------------------------------------------------------------------

interface UseContextDocumentsResult {
  data: ContextDocument[];
  isLoading: boolean;
  error: string | null;
}

export function useContextDocuments(): UseContextDocumentsResult {
  const [data, setData] = useState<ContextDocument[]>(MOCK_CONTEXT_DOCUMENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeContextDocuments(
      (items) => {
        setData(items.length > 0 ? items : MOCK_CONTEXT_DOCUMENTS);
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

interface UseContextDocumentByIdResult {
  data: ContextDocument | null;
  isLoading: boolean;
  error: string | null;
}

export function useContextDocumentById(
  id: string | undefined
): UseContextDocumentByIdResult {
  const [data, setData] = useState<ContextDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const mockItem =
      MOCK_CONTEXT_DOCUMENTS.find((d) => d.id === id) ?? null;
    setData(mockItem);

    const unsubscribe = subscribeContextDocumentById(
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

interface UseCreateContextDocumentResult {
  createContextDocument: (
    data: Omit<ContextDocument, "id" | "updated_at">
  ) => Promise<string>;
  isCreating: boolean;
  error: string | null;
}

export function useCreateContextDocument(): UseCreateContextDocumentResult {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createContextDocument = useCallback(
    async (
      data: Omit<ContextDocument, "id" | "updated_at">
    ): Promise<string> => {
      try {
        setIsCreating(true);
        setError(null);
        const id = await createService(data);
        return id;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to create context document";
        setError(message);
        throw err;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return { createContextDocument, isCreating, error };
}

interface UseUpdateContextDocumentResult {
  updateContextDocument: (
    id: string,
    data: Partial<Omit<ContextDocument, "id">>
  ) => Promise<void>;
  isUpdating: boolean;
  error: string | null;
}

export function useUpdateContextDocument(): UseUpdateContextDocumentResult {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateContextDocument = useCallback(
    async (
      id: string,
      data: Partial<Omit<ContextDocument, "id">>
    ): Promise<void> => {
      try {
        setIsUpdating(true);
        setError(null);
        await updateService(id, data);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to update context document";
        setError(message);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return { updateContextDocument, isUpdating, error };
}

interface UseDeleteContextDocumentResult {
  deleteContextDocument: (id: string) => Promise<void>;
  isDeleting: boolean;
  error: string | null;
}

export function useDeleteContextDocument(): UseDeleteContextDocumentResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteContextDocument = useCallback(
    async (id: string): Promise<void> => {
      try {
        setIsDeleting(true);
        setError(null);
        await deleteService(id);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to delete context document";
        setError(message);
        throw err;
      } finally {
        setIsDeleting(false);
      }
    },
    []
  );

  return { deleteContextDocument, isDeleting, error };
}

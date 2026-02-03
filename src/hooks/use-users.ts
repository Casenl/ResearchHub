"use client";

/**
 * Hooks for User documents.
 */

import { useState, useEffect, useCallback } from "react";

import {
  subscribeUsers,
  upsertUser as upsertUserService,
  updateUser as updateUserService,
  deleteUser as deleteUserService,
} from "@/lib/firestore/users";

import type { User } from "@/types";

// -----------------------------------------------------------------------------
// List hook
// -----------------------------------------------------------------------------

interface UseUsersResult {
  data: User[];
  isLoading: boolean;
  error: string | null;
}

export function useUsers(): UseUsersResult {
  const [data, setData] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeUsers(
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
  }, []);

  return { data, isLoading, error };
}

// -----------------------------------------------------------------------------
// Mutation hooks
// -----------------------------------------------------------------------------

interface UseUpsertUserResult {
  upsertUser: (user: User) => Promise<void>;
  isUpserting: boolean;
  error: string | null;
}

export function useUpsertUser(): UseUpsertUserResult {
  const [isUpserting, setIsUpserting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upsertUser = useCallback(async (user: User): Promise<void> => {
    try {
      setIsUpserting(true);
      setError(null);
      await upsertUserService(user);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save user";
      setError(message);
      throw err;
    } finally {
      setIsUpserting(false);
    }
  }, []);

  return { upsertUser, isUpserting, error };
}

interface UseUpdateUserResult {
  updateUser: (id: string, data: Partial<Omit<User, "id">>) => Promise<void>;
  isUpdating: boolean;
  error: string | null;
}

export function useUpdateUser(): UseUpdateUserResult {
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateUser = useCallback(
    async (id: string, data: Partial<Omit<User, "id">>): Promise<void> => {
      try {
        setIsUpdating(true);
        setError(null);
        await updateUserService(id, data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update user";
        setError(message);
        throw err;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return { updateUser, isUpdating, error };
}

interface UseDeleteUserResult {
  deleteUser: (id: string) => Promise<void>;
  isDeleting: boolean;
  error: string | null;
}

export function useDeleteUser(): UseDeleteUserResult {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    try {
      setIsDeleting(true);
      setError(null);
      await deleteUserService(id);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete user";
      setError(message);
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return { deleteUser, isDeleting, error };
}

"use client";

import { useState, useCallback } from "react";
import { transitionResearchStatus } from "@/lib/firestore/research";
import { useAuth } from "@/hooks/use-auth";

import type { ResearchStatus } from "@/types";

interface UseResearchTransitionReturn {
  isTransitioning: boolean;
  error: string | null;
  handleTransition: (
    id: string,
    from: ResearchStatus,
    to: ResearchStatus,
    title: string
  ) => Promise<boolean>;
}

export function useResearchTransition(): UseResearchTransitionReturn {
  const { user } = useAuth();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTransition = useCallback(
    async (
      id: string,
      from: ResearchStatus,
      to: ResearchStatus,
      title: string
    ): Promise<boolean> => {
      if (!user) {
        setError("You must be signed in to perform this action.");
        return false;
      }

      setIsTransitioning(true);
      setError(null);

      try {
        await transitionResearchStatus(
          id,
          from,
          to,
          { user_id: user.uid, display_name: user.displayName ?? "Unknown" },
          title
        );
        return true;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to update status.";
        console.error("Research transition failed:", err);
        setError(message);
        return false;
      } finally {
        setIsTransitioning(false);
      }
    },
    [user]
  );

  return { isTransitioning, error, handleTransition };
}

"use client";

import { useState, useEffect } from "react";
import { Loader2, Inbox } from "lucide-react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

import { getFirestoreDb } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";

import { ReviewStatsRow } from "./_components/review-stats-row";
import { ReviewItemCard } from "./_components/review-item-card";

import type { ReviewItem } from "./_components/review-item-card";

// =============================================================================
// ReviewQueuePage
// =============================================================================

export default function ReviewQueuePage(): React.JSX.Element {
  const { isAdmin } = useAuth();
  const [pendingItems, setPendingItems] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInFlight, setActionInFlight] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Real-time subscription
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const q = query(
      collection(getFirestoreDb(), "research"),
      where("review_status", "==", "pending"),
      orderBy("created_at", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as ReviewItem[];
      setPendingItems(items);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  const handleApprove = async (id: string) => {
    try {
      setActionInFlight(id);
      await updateDoc(doc(getFirestoreDb(), "research", id), {
        review_status: "approved",
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to approve research:", error);
    } finally {
      setActionInFlight(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setActionInFlight(id);
      await updateDoc(doc(getFirestoreDb(), "research", id), {
        review_status: "rejected",
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to reject research:", error);
    } finally {
      setActionInFlight(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Guard
  // ---------------------------------------------------------------------------

  if (!isAdmin) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        You do not have permission to view this page.
      </p>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Review Queue</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Agent-contributed research pending human review
        </p>
      </div>

      {/* Stats row */}
      <ReviewStatsRow
        totalPending={pendingItems.length}
        approvedToday={0}
        rejectedToday={0}
      />

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && pendingItems.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16">
            <Inbox className="size-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No agent-contributed research pending review
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pending items */}
      {!isLoading && pendingItems.length > 0 && (
        <div className="space-y-4">
          {pendingItems.map((item) => (
            <ReviewItemCard
              key={item.id}
              item={item}
              isActioning={actionInFlight === item.id}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}

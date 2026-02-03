"use client";

/**
 * Generic hook for subscribing to a Firestore collection in real-time.
 * Returns { data, isLoading, error }.
 */

import { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  query,
  type Query,
  type FirestoreDataConverter,
  type DocumentData,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

interface UseFirestoreCollectionResult<T> {
  data: T[];
  isLoading: boolean;
  error: string | null;
}

export function useFirestoreCollection<T extends { id: string }>(
  collectionPath: string,
  converter: FirestoreDataConverter<T>,
  queryModifier?: (baseQuery: Query<T>) => Query<T>
): UseFirestoreCollectionResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirestoreDb();
    const baseRef = collection(db, collectionPath).withConverter(converter);
    const q = queryModifier
      ? queryModifier(query(baseRef) as Query<T>)
      : query(baseRef);

    const unsubscribe = onSnapshot(
      q as Query<T, DocumentData>,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => doc.data());
        setData(items);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error(`Error subscribing to ${collectionPath}:`, err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionPath, converter, queryModifier]);

  return { data, isLoading, error };
}

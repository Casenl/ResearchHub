"use client";

/**
 * Generic hook for subscribing to a single Firestore document in real-time.
 * Returns { data, isLoading, error }.
 */

import { useState, useEffect } from "react";
import {
  doc,
  onSnapshot,
  type FirestoreDataConverter,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";

interface UseFirestoreDocumentResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useFirestoreDocument<T extends { id: string }>(
  collectionPath: string,
  documentId: string | undefined,
  converter: FirestoreDataConverter<T>
): UseFirestoreDocumentResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentId) return;

    const db = getFirestoreDb();
    const docRef = doc(db, collectionPath, documentId).withConverter(converter);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.data());
        } else {
          setData(null);
        }
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error(
          `Error subscribing to ${collectionPath}/${documentId}:`,
          err
        );
        setError(err.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionPath, documentId, converter]);

  if (!documentId) {
    return { data: null, isLoading: false, error: null };
  }

  return { data, isLoading, error };
}

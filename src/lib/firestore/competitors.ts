/**
 * Firestore service for Competitors.
 */

import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { competitorConverter } from "./converters";

import type { Competitor } from "@/types";

const COLLECTION = "competitors";

// -----------------------------------------------------------------------------
// Subscribe
// -----------------------------------------------------------------------------

export function subscribeCompetitors(
  onData: (items: Competitor[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const ref = collection(db, COLLECTION).withConverter(competitorConverter);
  const q = query(ref, orderBy("updated_at", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map((d) => d.data()));
    },
    (err) => {
      console.error("Error subscribing to competitors:", err);
      onError(err);
    }
  );
}

export function subscribeCompetitorById(
  id: string,
  onData: (item: Competitor | null) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, id).withConverter(competitorConverter);

  return onSnapshot(
    docRef,
    (snapshot) => {
      onData(snapshot.exists() ? snapshot.data() : null);
    },
    (err) => {
      console.error(`Error subscribing to competitors/${id}:`, err);
      onError(err);
    }
  );
}

// -----------------------------------------------------------------------------
// Mutations
// -----------------------------------------------------------------------------

export async function createCompetitor(
  data: Omit<Competitor, "id" | "created_at" | "updated_at">
): Promise<string> {
  const db = getFirestoreDb();
  const ref = collection(db, COLLECTION);
  const docRef = await addDoc(ref, {
    ...data,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCompetitor(
  id: string,
  data: Partial<Omit<Competitor, "id">>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updated_at: serverTimestamp(),
  });
}

export async function deleteCompetitor(id: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}

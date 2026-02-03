/**
 * Firestore service for Research documents.
 * Notebooks are embedded in Research documents (no subcollections).
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
import { researchConverter } from "./converters";

import type { Research } from "@/types";

const COLLECTION = "research";

// -----------------------------------------------------------------------------
// Subscribe
// -----------------------------------------------------------------------------

export function subscribeResearchList(
  onData: (items: Research[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const ref = collection(db, COLLECTION).withConverter(researchConverter);
  const q = query(ref, orderBy("updated_at", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map((d) => d.data()));
    },
    (err) => {
      console.error("Error subscribing to research list:", err);
      onError(err);
    }
  );
}

export function subscribeResearchById(
  id: string,
  onData: (item: Research | null) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, id).withConverter(researchConverter);

  return onSnapshot(
    docRef,
    (snapshot) => {
      onData(snapshot.exists() ? snapshot.data() : null);
    },
    (err) => {
      console.error(`Error subscribing to research/${id}:`, err);
      onError(err);
    }
  );
}

// -----------------------------------------------------------------------------
// Mutations
// -----------------------------------------------------------------------------

export async function createResearch(
  data: Omit<Research, "id" | "created_at" | "updated_at">
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

export async function updateResearch(
  id: string,
  data: Partial<Omit<Research, "id" | "created_at">>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updated_at: serverTimestamp(),
  });
}

export async function deleteResearch(id: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}

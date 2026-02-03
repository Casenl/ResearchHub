/**
 * Firestore service for Context Documents.
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
import { contextDocumentConverter } from "./converters";

import type { ContextDocument } from "@/types";

const COLLECTION = "context-documents";

// -----------------------------------------------------------------------------
// Subscribe
// -----------------------------------------------------------------------------

export function subscribeContextDocuments(
  onData: (items: ContextDocument[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const ref = collection(db, COLLECTION).withConverter(
    contextDocumentConverter
  );
  const q = query(ref, orderBy("updated_at", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map((d) => d.data()));
    },
    (err) => {
      console.error("Error subscribing to context documents:", err);
      onError(err);
    }
  );
}

export function subscribeContextDocumentById(
  id: string,
  onData: (item: ContextDocument | null) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, id).withConverter(
    contextDocumentConverter
  );

  return onSnapshot(
    docRef,
    (snapshot) => {
      onData(snapshot.exists() ? snapshot.data() : null);
    },
    (err) => {
      console.error(`Error subscribing to context-documents/${id}:`, err);
      onError(err);
    }
  );
}

// -----------------------------------------------------------------------------
// Mutations
// -----------------------------------------------------------------------------

export async function createContextDocument(
  data: Omit<ContextDocument, "id" | "updated_at">
): Promise<string> {
  const db = getFirestoreDb();
  const ref = collection(db, COLLECTION);
  const docRef = await addDoc(ref, {
    ...data,
    updated_at: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateContextDocument(
  id: string,
  data: Partial<Omit<ContextDocument, "id">>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updated_at: serverTimestamp(),
  });
}

export async function deleteContextDocument(id: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}

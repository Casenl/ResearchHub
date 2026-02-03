/**
 * Firestore service for API Usage entries.
 */

import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { apiUsageConverter } from "./converters";

import type { ApiUsageEntry } from "@/types";

const COLLECTION = "api-usage";

// -----------------------------------------------------------------------------
// Subscribe
// -----------------------------------------------------------------------------

export function subscribeApiUsage(
  onData: (items: ApiUsageEntry[]) => void,
  onError: (error: Error) => void,
  maxEntries: number = 200
): Unsubscribe {
  const db = getFirestoreDb();
  const ref = collection(db, COLLECTION).withConverter(apiUsageConverter);
  const q = query(ref, orderBy("timestamp", "desc"), limit(maxEntries));

  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => d.data())),
    (err) => {
      console.error("Error subscribing to API usage:", err);
      onError(err);
    }
  );
}

// -----------------------------------------------------------------------------
// Write
// -----------------------------------------------------------------------------

export async function writeApiUsageEntry(
  data: Omit<ApiUsageEntry, "id" | "timestamp">
): Promise<string> {
  const db = getFirestoreDb();
  const ref = collection(db, COLLECTION);
  const docRef = await addDoc(ref, {
    ...data,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
}

/** Write a usage entry with a specific ID (used for seeding). */
export async function writeApiUsageEntryWithId(
  entry: ApiUsageEntry
): Promise<void> {
  const db = getFirestoreDb();
  const { id, ...data } = entry;
  const docRef = doc(db, COLLECTION, id);
  const { setDoc: firestoreSetDoc } = await import("firebase/firestore");
  await firestoreSetDoc(docRef, data);
}

/**
 * Firestore service for Activity Log entries.
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
import { activityLogConverter } from "./converters";

import type { ActivityLogEntry } from "@/types";

const COLLECTION = "activity-log";

// -----------------------------------------------------------------------------
// Subscribe
// -----------------------------------------------------------------------------

export function subscribeActivityLog(
  onData: (items: ActivityLogEntry[]) => void,
  onError: (error: Error) => void,
  maxEntries: number = 100
): Unsubscribe {
  const db = getFirestoreDb();
  const ref = collection(db, COLLECTION).withConverter(activityLogConverter);
  const q = query(ref, orderBy("timestamp", "desc"), limit(maxEntries));

  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => d.data())),
    (err) => {
      console.error("Error subscribing to activity log:", err);
      onError(err);
    }
  );
}

// -----------------------------------------------------------------------------
// Write
// -----------------------------------------------------------------------------

export async function writeActivityLogEntry(
  data: Omit<ActivityLogEntry, "id" | "timestamp">
): Promise<string> {
  const db = getFirestoreDb();
  const ref = collection(db, COLLECTION);
  const docRef = await addDoc(ref, {
    ...data,
    timestamp: serverTimestamp(),
  });
  return docRef.id;
}

/** Write an activity entry with a specific ID (used for seeding). */
export async function writeActivityLogEntryWithId(
  entry: ActivityLogEntry
): Promise<void> {
  const db = getFirestoreDb();
  const { id, ...data } = entry;
  const docRef = doc(db, COLLECTION, id);
  const { setDoc: firestoreSetDoc } = await import("firebase/firestore");
  await firestoreSetDoc(docRef, data);
}

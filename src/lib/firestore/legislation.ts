/**
 * Firestore service for Legislation.
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
  where,
  limit,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { legislationConverter } from "./converters";

import type { Legislation } from "@/types";

const COLLECTION = "legislation";

// -----------------------------------------------------------------------------
// Subscribe — all
// -----------------------------------------------------------------------------

export function subscribeLegislation(
  onData: (items: Legislation[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const ref = collection(db, COLLECTION).withConverter(legislationConverter);
  const q = query(ref, orderBy("updated_at", "desc"), limit(500));

  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map((d) => d.data()));
    },
    (err) => {
      console.error("Error subscribing to legislation:", err);
      onError(err);
    }
  );
}

// -----------------------------------------------------------------------------
// Subscribe — single
// -----------------------------------------------------------------------------

export function subscribeLegislationById(
  id: string,
  onData: (item: Legislation | null) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, id).withConverter(legislationConverter);

  return onSnapshot(
    docRef,
    (snapshot) => {
      onData(snapshot.exists() ? snapshot.data() : null);
    },
    (err) => {
      console.error(`Error subscribing to legislation/${id}:`, err);
      onError(err);
    }
  );
}

// -----------------------------------------------------------------------------
// Subscribe — by dimensions (for wizard auto-suggest)
// Uses array-contains-any on market_ids, client-filters on sector_ids.
// -----------------------------------------------------------------------------

export function subscribeLegislationByDimensions(
  marketIds: string[],
  sectorIds: string[],
  onData: (items: Legislation[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  if (marketIds.length === 0) {
    onData([]);
    return () => {};
  }

  const db = getFirestoreDb();
  const ref = collection(db, COLLECTION).withConverter(legislationConverter);
  // Firestore array-contains-any supports max 30 values
  const marketSlice = marketIds.slice(0, 30);
  const q = query(
    ref,
    where("market_ids", "array-contains-any", marketSlice),
    orderBy("name")
  );

  return onSnapshot(
    q,
    (snapshot) => {
      let items = snapshot.docs.map((d) => d.data());
      // Client-side filter: at least one sector_id must match
      if (sectorIds.length > 0) {
        const sectorSet = new Set(sectorIds);
        items = items.filter((item) =>
          item.sector_ids.some((sid) => sectorSet.has(sid))
        );
      }
      onData(items);
    },
    (err) => {
      console.error("Error subscribing to legislation by dimensions:", err);
      onError(err);
    }
  );
}

// -----------------------------------------------------------------------------
// Mutations
// -----------------------------------------------------------------------------

export async function createLegislation(
  data: Omit<Legislation, "id" | "created_at" | "updated_at">
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

export async function updateLegislation(
  id: string,
  data: Partial<Omit<Legislation, "id">>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updated_at: serverTimestamp(),
  });
}

export async function deleteLegislation(id: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}

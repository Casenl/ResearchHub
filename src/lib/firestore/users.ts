/**
 * Firestore service for User documents.
 */

import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import { userConverter } from "./converters";

import type { User } from "@/types";

const COLLECTION = "users";

// -----------------------------------------------------------------------------
// Subscribe
// -----------------------------------------------------------------------------

export function subscribeUsers(
  onData: (items: User[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const ref = collection(db, COLLECTION).withConverter(userConverter);
  const q = query(ref, orderBy("name", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      onData(snapshot.docs.map((d) => d.data()));
    },
    (err) => {
      console.error("Error subscribing to users:", err);
      onError(err);
    }
  );
}

export function subscribeUserById(
  id: string,
  onData: (item: User | null) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, id).withConverter(userConverter);

  return onSnapshot(
    docRef,
    (snapshot) => {
      onData(snapshot.exists() ? snapshot.data() : null);
    },
    (err) => {
      console.error(`Error subscribing to users/${id}:`, err);
      onError(err);
    }
  );
}

// -----------------------------------------------------------------------------
// Mutations
// -----------------------------------------------------------------------------

/** Create or overwrite a user document (uses setDoc with user's auth UID as doc ID). */
export async function upsertUser(user: User): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, user.id);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...data } = user;
  await setDoc(docRef, data, { merge: true });
}

export async function updateUser(
  id: string,
  data: Partial<Omit<User, "id">>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, data);
}

export async function deleteUser(id: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}

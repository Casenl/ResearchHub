/**
 * Firestore service for taxonomy data (markets, domains, sectors, tags).
 * Taxonomy is stored as single documents with { items: T[] } arrays.
 */

import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  type Unsubscribe,
  type DocumentData,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import {
  parseTaxonomyDoc,
  parseMarket,
  parseDomain,
  parseSector,
  parseTag,
} from "./converters";

import type { Market, Domain, Sector, Tag } from "@/types";

// -----------------------------------------------------------------------------
// Collection / document paths
// -----------------------------------------------------------------------------

const TAXONOMY_COLLECTION = "taxonomy";
const MARKETS_DOC = "markets";
const DOMAINS_DOC = "domains";
const SECTORS_DOC = "sectors";
const TAGS_DOC = "tags";

// -----------------------------------------------------------------------------
// Subscribe helpers
// -----------------------------------------------------------------------------

function subscribeTaxonomy<T>(
  docId: string,
  parser: (data: DocumentData) => T,
  onData: (items: T[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const docRef = doc(db, TAXONOMY_COLLECTION, docId);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const { items } = parseTaxonomyDoc<DocumentData>(snapshot.data());
        onData(items.map(parser));
      } else {
        onData([]);
      }
    },
    (err) => {
      console.error(`Error subscribing to taxonomy/${docId}:`, err);
      onError(err);
    }
  );
}

export function subscribeMarkets(
  onData: (items: Market[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return subscribeTaxonomy(MARKETS_DOC, parseMarket, onData, onError);
}

export function subscribeDomains(
  onData: (items: Domain[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return subscribeTaxonomy(DOMAINS_DOC, parseDomain, onData, onError);
}

export function subscribeSectors(
  onData: (items: Sector[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return subscribeTaxonomy(SECTORS_DOC, parseSector, onData, onError);
}

export function subscribeTags(
  onData: (items: Tag[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return subscribeTaxonomy(TAGS_DOC, parseTag, onData, onError);
}

// -----------------------------------------------------------------------------
// Save helpers (replace entire items array)
// -----------------------------------------------------------------------------

async function saveTaxonomyItems<T>(docId: string, items: T[]): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, TAXONOMY_COLLECTION, docId);
  await setDoc(docRef, { items });
}

export async function saveMarkets(items: Market[]): Promise<void> {
  return saveTaxonomyItems(MARKETS_DOC, items);
}

export async function saveDomains(items: Domain[]): Promise<void> {
  return saveTaxonomyItems(DOMAINS_DOC, items);
}

export async function saveSectors(items: Sector[]): Promise<void> {
  return saveTaxonomyItems(SECTORS_DOC, items);
}

export async function saveTags(items: Tag[]): Promise<void> {
  return saveTaxonomyItems(TAGS_DOC, items);
}

// -----------------------------------------------------------------------------
// One-time read helpers (for seeding checks)
// -----------------------------------------------------------------------------

export async function getMarkets(): Promise<Market[]> {
  const db = getFirestoreDb();
  const snapshot = await getDoc(doc(db, TAXONOMY_COLLECTION, MARKETS_DOC));
  if (!snapshot.exists()) return [];
  const { items } = parseTaxonomyDoc<DocumentData>(snapshot.data());
  return items.map(parseMarket);
}

export async function getDomains(): Promise<Domain[]> {
  const db = getFirestoreDb();
  const snapshot = await getDoc(doc(db, TAXONOMY_COLLECTION, DOMAINS_DOC));
  if (!snapshot.exists()) return [];
  const { items } = parseTaxonomyDoc<DocumentData>(snapshot.data());
  return items.map(parseDomain);
}

export async function getSectors(): Promise<Sector[]> {
  const db = getFirestoreDb();
  const snapshot = await getDoc(doc(db, TAXONOMY_COLLECTION, SECTORS_DOC));
  if (!snapshot.exists()) return [];
  const { items } = parseTaxonomyDoc<DocumentData>(snapshot.data());
  return items.map(parseSector);
}

export async function getTags(): Promise<Tag[]> {
  const db = getFirestoreDb();
  const snapshot = await getDoc(doc(db, TAXONOMY_COLLECTION, TAGS_DOC));
  if (!snapshot.exists()) return [];
  const { items } = parseTaxonomyDoc<DocumentData>(snapshot.data());
  return items.map(parseTag);
}

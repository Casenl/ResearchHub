/**
 * Firestore service for admin entities:
 * - Prompt Templates
 * - AI Tool Profiles
 * - Prompt Assignments
 * - Context Rules
 */

import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirestoreDb } from "@/lib/firebase";
import {
  promptTemplateConverter,
  aiToolProfileConverter,
  promptAssignmentConverter,
  contextRuleConverter,
} from "./converters";

import type {
  PromptTemplate,
  AIToolProfile,
  PromptAssignment,
  ContextRule,
} from "@/types";

// -----------------------------------------------------------------------------
// Prompt Templates
// -----------------------------------------------------------------------------

const TEMPLATES_COLLECTION = "prompt-templates";

export function subscribePromptTemplates(
  onData: (items: PromptTemplate[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const ref = collection(db, TEMPLATES_COLLECTION).withConverter(
    promptTemplateConverter
  );
  const q = query(ref, orderBy("domain", "asc"));

  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => d.data())),
    (err) => {
      console.error("Error subscribing to prompt templates:", err);
      onError(err);
    }
  );
}

export async function createPromptTemplate(
  data: Omit<PromptTemplate, "id" | "created_at">
): Promise<string> {
  const db = getFirestoreDb();
  const ref = collection(db, TEMPLATES_COLLECTION);
  const docRef = await addDoc(ref, {
    ...data,
    created_at: serverTimestamp(),
  });
  return docRef.id;
}

export async function updatePromptTemplate(
  id: string,
  data: Partial<Omit<PromptTemplate, "id">>
): Promise<void> {
  const db = getFirestoreDb();
  await updateDoc(doc(db, TEMPLATES_COLLECTION, id), data);
}

export async function deletePromptTemplate(id: string): Promise<void> {
  const db = getFirestoreDb();
  await deleteDoc(doc(db, TEMPLATES_COLLECTION, id));
}

// -----------------------------------------------------------------------------
// AI Tool Profiles
// -----------------------------------------------------------------------------

const AI_TOOLS_COLLECTION = "ai-tool-profiles";

export function subscribeAIToolProfiles(
  onData: (items: AIToolProfile[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const ref = collection(db, AI_TOOLS_COLLECTION).withConverter(
    aiToolProfileConverter
  );
  const q = query(ref, orderBy("name", "asc"));

  return onSnapshot(
    q,
    (snapshot) => onData(snapshot.docs.map((d) => d.data())),
    (err) => {
      console.error("Error subscribing to AI tool profiles:", err);
      onError(err);
    }
  );
}

export async function upsertAIToolProfile(
  profile: AIToolProfile
): Promise<void> {
  const db = getFirestoreDb();
  const { id, ...data } = profile;
  await setDoc(doc(db, AI_TOOLS_COLLECTION, id), {
    ...data,
    updated_at: serverTimestamp(),
  });
}

export async function deleteAIToolProfile(id: string): Promise<void> {
  const db = getFirestoreDb();
  await deleteDoc(doc(db, AI_TOOLS_COLLECTION, id));
}

// -----------------------------------------------------------------------------
// Prompt Assignments
// -----------------------------------------------------------------------------

const ASSIGNMENTS_COLLECTION = "prompt-assignments";

export function subscribePromptAssignments(
  onData: (items: PromptAssignment[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const ref = collection(db, ASSIGNMENTS_COLLECTION).withConverter(
    promptAssignmentConverter
  );

  return onSnapshot(
    query(ref),
    (snapshot) => onData(snapshot.docs.map((d) => d.data())),
    (err) => {
      console.error("Error subscribing to prompt assignments:", err);
      onError(err);
    }
  );
}

export async function upsertPromptAssignment(
  assignment: PromptAssignment
): Promise<void> {
  const db = getFirestoreDb();
  const { id, ...data } = assignment;
  await setDoc(doc(db, ASSIGNMENTS_COLLECTION, id), {
    ...data,
    updated_at: serverTimestamp(),
  });
}

export async function deletePromptAssignment(id: string): Promise<void> {
  const db = getFirestoreDb();
  await deleteDoc(doc(db, ASSIGNMENTS_COLLECTION, id));
}

// -----------------------------------------------------------------------------
// Context Rules
// -----------------------------------------------------------------------------

const CONTEXT_RULES_COLLECTION = "context-rules";

export function subscribeContextRules(
  onData: (items: ContextRule[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const ref = collection(db, CONTEXT_RULES_COLLECTION).withConverter(
    contextRuleConverter
  );

  return onSnapshot(
    query(ref),
    (snapshot) => onData(snapshot.docs.map((d) => d.data())),
    (err) => {
      console.error("Error subscribing to context rules:", err);
      onError(err);
    }
  );
}

export async function upsertContextRule(rule: ContextRule): Promise<void> {
  const db = getFirestoreDb();
  const { id, ...data } = rule;
  await setDoc(doc(db, CONTEXT_RULES_COLLECTION, id), {
    ...data,
    updated_at: serverTimestamp(),
  });
}

export async function deleteContextRule(id: string): Promise<void> {
  const db = getFirestoreDb();
  await deleteDoc(doc(db, CONTEXT_RULES_COLLECTION, id));
}

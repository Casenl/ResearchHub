import { getAdminFirestore } from '@/lib/firebase-admin';
import {
  CreateLegislationSchema,
  UpdateLegislationSchema,
  QueryLegislationSchema,
} from '@/lib/validations';
import { createAuditLog } from './audit-service';
import type { Legislation } from '@/types';

type LegislationWithId = Legislation & { id: string };

/** Create a new legislation entry. */
export async function createLegislationEntry(
  input: unknown,
  actorId: string,
  actorName: string,
): Promise<LegislationWithId> {
  const validated = CreateLegislationSchema.parse(input);
  const db = getAdminFirestore();
  const now = new Date().toISOString();

  const entry: Omit<Legislation, 'id'> = {
    name: validated.name,
    description: validated.description,
    market_ids: validated.market_ids,
    sector_ids: validated.sector_ids,
    scope: validated.scope,
    effective_date: validated.effective_date,
    enforcement_authority: validated.enforcement_authority,
    compliance_deadline: validated.compliance_deadline,
    context_document_id: validated.context_document_id,
    url: validated.url,
    tags: validated.tags,
    created_by: actorId,
    created_at: now,
    updated_at: now,
  };

  const docRef = await db.collection('legislation').add(entry);

  await createAuditLog({
    actor_id: actorId,
    actor_name: actorName,
    action: 'created',
    target_type: 'legislation',
    target_id: docRef.id,
    target_name: validated.name,
    category: 'api',
  });

  return { id: docRef.id, ...entry };
}

/** Get a legislation entry by ID. */
export async function getLegislationEntry(id: string): Promise<LegislationWithId | null> {
  const db = getAdminFirestore();
  const doc = await db.collection('legislation').doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as LegislationWithId;
}

/** Update a legislation entry. */
export async function updateLegislationEntry(
  id: string,
  input: unknown,
  actorId: string,
  actorName: string,
): Promise<void> {
  const validated = UpdateLegislationSchema.parse(input);
  const db = getAdminFirestore();

  const docRef = db.collection('legislation').doc(id);
  const doc = await docRef.get();
  if (!doc.exists) throw new Error(`Legislation ${id} not found`);

  await docRef.update({
    ...validated,
    updated_at: new Date().toISOString(),
  });

  await createAuditLog({
    actor_id: actorId,
    actor_name: actorName,
    action: 'updated',
    target_type: 'legislation',
    target_id: id,
    target_name: doc.data()?.name ?? id,
    category: 'api',
    details: { fields_updated: Object.keys(validated) },
  });
}

/** Query legislation entries with optional filters. */
export async function queryLegislationEntries(
  input: unknown,
): Promise<{ total: number; results: LegislationWithId[] }> {
  const filters = QueryLegislationSchema.parse(input);
  const db = getAdminFirestore();

  let ref: FirebaseFirestore.Query = db
    .collection('legislation')
    .orderBy('name');

  if (filters.market_id) {
    ref = ref.where('market_ids', 'array-contains', filters.market_id);
  }

  if (filters.scope) {
    ref = ref.where('scope', '==', filters.scope);
  }

  const snapshot = await ref.limit(filters.limit + filters.offset).get();
  let results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as LegislationWithId));

  // Client-side sector filter (Firestore doesn't support multiple array-contains)
  if (filters.sector_id) {
    results = results.filter((r) => r.sector_ids.includes(filters.sector_id!));
  }

  // Apply offset
  results = results.slice(filters.offset, filters.offset + filters.limit);

  return { total: results.length, results };
}

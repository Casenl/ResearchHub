import { getAdminFirestore } from '@/lib/firebase-admin';
import { CreateResearchSchema, UpdateResearchSchema } from '@/lib/validations';
import { createAuditLog } from './audit-service';
import { MARKETS } from '@/data/markets';
import { DOMAINS } from '@/data/domains';
import { SECTORS } from '@/data/sectors';
import type { Research } from '@/types';

type ResearchWithId = Research & { id: string };

/** Create a new research entry. */
export async function createResearch(
  input: unknown,
  actorId: string,
  actorName: string,
): Promise<ResearchWithId> {
  const validated = CreateResearchSchema.parse(input);
  const db = getAdminFirestore();
  const now = new Date().toISOString();

  const research: Omit<Research, 'id'> = {
    title: validated.title,
    description: validated.description,
    type: validated.type,
    previous_version_id: null,
    cloned_from_id: null,
    cloned_changed_dimension: null,
    status: 'draft',
    output_format: validated.output_format,
    created_at: now,
    updated_at: now,
    published_at: null,
    expires_at: null,
    refresh_schedule: validated.refresh_schedule,
    next_refresh_date: null,
    author_id: actorId,
    reviewer_id: null,
    dimensions: {
      markets: validated.dimensions.market_ids
        .map(id => MARKETS.find(m => m.id === id))
        .filter((m): m is NonNullable<typeof m> => m != null),
      domains: validated.dimensions.domain_ids
        .map(id => DOMAINS.find(d => d.id === id))
        .filter((d): d is NonNullable<typeof d> => d != null),
      sectors: validated.dimensions.sector_ids
        .map(id => SECTORS.find(s => s.id === id))
        .filter((s): s is NonNullable<typeof s> => s != null),
    },
    tags: [],
    context_documents: [],
    notebooks: [],
    synthesis: validated.synthesis,
    change_log: '',
    assumptions: validated.assumptions,
    related_research_ids: [],
    version_ids: [],
    origin: validated.origin,
    agent_identity: validated.agent_identity,
    input_context: validated.input_context,
    review_status: validated.origin === 'agent' ? 'pending' : 'none',
  };

  try {
    const docRef = await db.collection('research').add(research);
    const result = { id: docRef.id, ...research };

    await createAuditLog({
      actor_id: actorId,
      actor_name: actorName,
      action: 'created',
      target_type: 'research',
      target_id: docRef.id,
      target_name: validated.title,
      category: validated.origin === 'agent' ? 'api' : 'research',
    });

    return result;
  } catch (error) {
    console.error('Research creation failed:', error);
    throw error;
  }
}

/** Get a research entry by ID. */
export async function getResearch(researchId: string): Promise<ResearchWithId | null> {
  const db = getAdminFirestore();
  try {
    const doc = await db.collection('research').doc(researchId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as ResearchWithId;
  } catch (error) {
    console.error('Research fetch failed:', error);
    throw error;
  }
}

/** Update a research entry. */
export async function updateResearch(
  researchId: string,
  input: unknown,
  actorId: string,
  actorName: string,
): Promise<void> {
  const validated = UpdateResearchSchema.parse(input);
  const db = getAdminFirestore();

  try {
    const docRef = db.collection('research').doc(researchId);
    const doc = await docRef.get();
    if (!doc.exists) throw new Error(`Research ${researchId} not found`);

    await docRef.update({
      ...validated,
      updated_at: new Date().toISOString(),
    });

    await createAuditLog({
      actor_id: actorId,
      actor_name: actorName,
      action: 'updated',
      target_type: 'research',
      target_id: researchId,
      target_name: doc.data()?.title ?? researchId,
      category: 'research',
      details: { fields_updated: Object.keys(validated) },
    });
  } catch (error) {
    console.error('Research update failed:', error);
    throw error;
  }
}

/** Soft-delete a research entry (set status to 'archived'). */
export async function archiveResearch(
  researchId: string,
  actorId: string,
  actorName: string,
): Promise<void> {
  const db = getAdminFirestore();
  try {
    const docRef = db.collection('research').doc(researchId);
    const doc = await docRef.get();
    if (!doc.exists) throw new Error(`Research ${researchId} not found`);

    await docRef.update({
      status: 'archived',
      updated_at: new Date().toISOString(),
    });

    await createAuditLog({
      actor_id: actorId,
      actor_name: actorName,
      action: 'archived',
      target_type: 'research',
      target_id: researchId,
      target_name: doc.data()?.title ?? researchId,
      category: 'research',
    });
  } catch (error) {
    console.error('Research archival failed:', error);
    throw error;
  }
}

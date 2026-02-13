import { Router, Response } from 'express';
import { ZodError } from 'zod';
import { db } from '../lib/admin';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';
import {
  CreateResearchSchema,
  UpdateResearchSchema,
  QueryResearchSchema,
  DocumentIdSchema,
} from '../schemas';

export const researchRouter = Router();

/** Helper: write an audit log entry (fire-and-forget). */
function auditLog(
  req: AuthenticatedRequest,
  action: 'created' | 'updated' | 'archived',
  targetId: string,
  targetName: string,
  details: Record<string, unknown> = {},
): void {
  const identity = req.apiKey!.agent_identity;
  db().collection('audit_logs').add({
    timestamp: new Date().toISOString(),
    actor: { user_id: identity.agent_id, display_name: identity.agent_name },
    action,
    target_type: 'research',
    target_id: targetId,
    target_name: targetName,
    details,
    category: 'api',
  }).catch(() => {});
}

/** Helper: map ZodError to 400 response. */
function handleError(res: Response, error: unknown): void {
  if (error instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', issues: error.issues });
    return;
  }
  console.error('Research route error:', error);
  res.status(500).json({ error: 'Internal server error' });
}

// POST / — Create research
researchRouter.post(
  '/',
  requirePermission('read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = CreateResearchSchema.parse(req.body);
      const identity = req.apiKey!.agent_identity;
      const now = new Date().toISOString();

      const research = {
        title: data.title,
        description: data.description,
        type: data.type,
        output_format: data.output_format,
        refresh_schedule: data.refresh_schedule,
        previous_version_id: null,
        cloned_from_id: null,
        cloned_changed_dimension: null,
        status: 'draft' as const,
        created_at: now,
        updated_at: now,
        published_at: null,
        expires_at: null,
        next_refresh_date: null,
        author_id: identity.agent_id,
        reviewer_id: null,
        dimensions: {
          markets: data.dimensions.market_ids,
          domains: data.dimensions.domain_ids,
          sectors: data.dimensions.sector_ids,
        },
        tags: data.tag_ids,
        context_documents: data.context_document_ids,
        notebooks: [],
        findings: data.findings,
        synthesis: data.synthesis,
        change_log: '',
        assumptions: data.assumptions,
        related_research_ids: [],
        version_ids: [],
        origin: 'agent' as const,
        agent_identity: identity,
        input_context: data.input_context,
        review_status: 'pending' as const,
      };

      const ref = await db().collection('research').add(research);
      auditLog(req, 'created', ref.id, data.title);
      res.status(201).json({ id: ref.id, ...research });
    } catch (error) {
      handleError(res, error);
    }
  },
);

// GET /:id — Get single research
researchRouter.get(
  '/:id',
  requirePermission('read', 'read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = DocumentIdSchema.parse(req.params.id);
      const doc = await db().collection('research').doc(id).get();
      if (!doc.exists) {
        res.status(404).json({ error: 'Research not found' });
        return;
      }
      res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      handleError(res, error);
    }
  },
);

// GET / — Query research with filters
researchRouter.get(
  '/',
  requirePermission('read', 'read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const q = QueryResearchSchema.parse({
        ...req.query,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        offset: req.query.offset ? Number(req.query.offset) : undefined,
        min_trust_tier: req.query.min_trust_tier ? Number(req.query.min_trust_tier) : undefined,
      });

      let query: FirebaseFirestore.Query = db().collection('research');

      if (q.origin) query = query.where('origin', '==', q.origin);
      if (q.status) query = query.where('status', '==', q.status);
      if (q.fresher_than) query = query.where('updated_at', '>=', q.fresher_than);

      const snapshot = await query.get();
      let results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Client-side dimension filtering (Firestore can't query nested arrays)
      if (q.region) results = results.filter((r: any) => r.dimensions?.markets?.includes(q.region));
      if (q.domain) results = results.filter((r: any) => r.dimensions?.domains?.includes(q.domain));
      if (q.sector) results = results.filter((r: any) => r.dimensions?.sectors?.includes(q.sector));

      const total = results.length;
      results = results.slice(q.offset, q.offset + q.limit);

      res.json({ total, limit: q.limit, offset: q.offset, results });
    } catch (error) {
      handleError(res, error);
    }
  },
);

// PATCH /:id — Update research
researchRouter.patch(
  '/:id',
  requirePermission('read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = UpdateResearchSchema.parse(req.body);
      const id = DocumentIdSchema.parse(req.params.id);
      const ref = db().collection('research').doc(id);
      const doc = await ref.get();

      if (!doc.exists) {
        res.status(404).json({ error: 'Research not found' });
        return;
      }

      await ref.update({ ...data, updated_at: new Date().toISOString() });
      auditLog(req, 'updated', id, doc.data()?.title ?? '');
      res.json({ message: 'Research updated' });
    } catch (error) {
      handleError(res, error);
    }
  },
);

// DELETE /:id — Soft delete (archive)
researchRouter.delete(
  '/:id',
  requirePermission('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = DocumentIdSchema.parse(req.params.id);
      const ref = db().collection('research').doc(id);
      const doc = await ref.get();

      if (!doc.exists) {
        res.status(404).json({ error: 'Research not found' });
        return;
      }

      await ref.update({ status: 'archived', updated_at: new Date().toISOString() });
      auditLog(req, 'archived', id, doc.data()?.title ?? '');
      res.json({ message: 'Research archived' });
    } catch (error) {
      handleError(res, error);
    }
  },
);

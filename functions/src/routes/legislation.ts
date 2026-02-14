import { Router, Response } from 'express';
import { ZodError } from 'zod';
import { db } from '../lib/admin';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';
import {
  CreateLegislationSchema,
  UpdateLegislationSchema,
  DocumentIdSchema,
} from '../schemas';

export const legislationRouter = Router();

const COLLECTION = 'legislation';

/** Helper: write an audit log entry (fire-and-forget). */
function auditLog(
  req: AuthenticatedRequest,
  action: 'created' | 'updated' | 'deleted',
  targetId: string,
  targetName: string,
  details: Record<string, unknown> = {},
): void {
  const identity = req.apiKey!.agent_identity;
  db().collection('audit_logs').add({
    timestamp: new Date().toISOString(),
    actor: { user_id: identity.agent_id, display_name: identity.agent_name },
    action,
    target_type: 'legislation',
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
  console.error('Legislation route error:', error);
  res.status(500).json({ error: 'Internal server error' });
}

// GET / — List all legislation
legislationRouter.get(
  '/',
  requirePermission('read', 'read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const snapshot = await db()
        .collection(COLLECTION)
        .orderBy('name')
        .get();

      const results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      res.json({ total: results.length, results });
    } catch (error) {
      handleError(res, error);
    }
  },
);

// POST / — Create legislation (admin only)
legislationRouter.post(
  '/',
  requirePermission('read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = CreateLegislationSchema.parse(req.body);
      const identity = req.apiKey!.agent_identity;
      const now = new Date().toISOString();

      const entry = {
        ...data,
        created_by: identity.agent_id,
        created_at: now,
        updated_at: now,
      };

      const ref = await db().collection(COLLECTION).add(entry);
      auditLog(req, 'created', ref.id, data.name);
      res.status(201).json({ id: ref.id, ...entry });
    } catch (error) {
      handleError(res, error);
    }
  },
);

// GET /:id — Get single legislation
legislationRouter.get(
  '/:id',
  requirePermission('read', 'read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = DocumentIdSchema.parse(req.params.id);
      const doc = await db().collection(COLLECTION).doc(id).get();
      if (!doc.exists) {
        res.status(404).json({ error: 'Legislation not found' });
        return;
      }
      res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      handleError(res, error);
    }
  },
);

// PUT /:id — Update legislation (admin only)
legislationRouter.put(
  '/:id',
  requirePermission('read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = UpdateLegislationSchema.parse(req.body);
      const id = DocumentIdSchema.parse(req.params.id);
      const ref = db().collection(COLLECTION).doc(id);
      const doc = await ref.get();

      if (!doc.exists) {
        res.status(404).json({ error: 'Legislation not found' });
        return;
      }

      await ref.update({ ...data, updated_at: new Date().toISOString() });
      auditLog(req, 'updated', id, doc.data()?.name ?? '');
      res.json({ message: 'Legislation updated' });
    } catch (error) {
      handleError(res, error);
    }
  },
);

// DELETE /:id — Delete legislation (admin only)
legislationRouter.delete(
  '/:id',
  requirePermission('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = DocumentIdSchema.parse(req.params.id);
      const ref = db().collection(COLLECTION).doc(id);
      const doc = await ref.get();

      if (!doc.exists) {
        res.status(404).json({ error: 'Legislation not found' });
        return;
      }

      const name = doc.data()?.name ?? '';
      await ref.delete();
      auditLog(req, 'deleted', id, name);
      res.json({ message: 'Legislation deleted' });
    } catch (error) {
      handleError(res, error);
    }
  },
);

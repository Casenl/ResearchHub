import { Router, Response } from 'express';
import { ZodError } from 'zod';
import { randomUUID } from 'crypto';
import { db } from '../lib/admin';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';
import {
  CreateCompetitorSchema,
  UpdateCompetitorSchema,
  AddPositionSchema,
  UpdatePositionSchema,
  AddEventSchema,
  DocumentIdSchema,
} from '../schemas';

export const competitorsRouter = Router();

const COLLECTION = 'competitors';

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
    target_type: 'competitor',
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
  console.error('Competitors route error:', error);
  res.status(500).json({ error: 'Internal server error' });
}

// GET / — List all competitors
competitorsRouter.get(
  '/',
  requirePermission('read', 'read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const snapshot = await db()
        .collection(COLLECTION)
        .orderBy('updated_at', 'desc')
        .get();

      const results = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      res.json({ total: results.length, results });
    } catch (error) {
      handleError(res, error);
    }
  },
);

// POST / — Create competitor
competitorsRouter.post(
  '/',
  requirePermission('read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = CreateCompetitorSchema.parse(req.body);
      const identity = req.apiKey!.agent_identity;
      const now = new Date().toISOString();

      const competitor = {
        ...data,
        logo_url: null,
        positions: [],
        events: [],
        created_by: identity.agent_id,
        created_at: now,
        updated_at: now,
      };

      const ref = await db().collection(COLLECTION).add(competitor);
      auditLog(req, 'created', ref.id, data.name);
      res.status(201).json({ id: ref.id, ...competitor });
    } catch (error) {
      handleError(res, error);
    }
  },
);

// GET /:id — Get single competitor
competitorsRouter.get(
  '/:id',
  requirePermission('read', 'read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = DocumentIdSchema.parse(req.params.id);
      const doc = await db().collection(COLLECTION).doc(id).get();
      if (!doc.exists) {
        res.status(404).json({ error: 'Competitor not found' });
        return;
      }
      res.json({ id: doc.id, ...doc.data() });
    } catch (error) {
      handleError(res, error);
    }
  },
);

// PUT /:id — Update competitor
competitorsRouter.put(
  '/:id',
  requirePermission('read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = UpdateCompetitorSchema.parse(req.body);
      const id = DocumentIdSchema.parse(req.params.id);
      const ref = db().collection(COLLECTION).doc(id);
      const doc = await ref.get();

      if (!doc.exists) {
        res.status(404).json({ error: 'Competitor not found' });
        return;
      }

      await ref.update({ ...data, updated_at: new Date().toISOString() });
      auditLog(req, 'updated', id, doc.data()?.name ?? '');
      res.json({ message: 'Competitor updated' });
    } catch (error) {
      handleError(res, error);
    }
  },
);

// POST /:id/positions — Add a competitive position
competitorsRouter.post(
  '/:id/positions',
  requirePermission('read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = AddPositionSchema.parse(req.body);
      const id = DocumentIdSchema.parse(req.params.id);
      const identity = req.apiKey!.agent_identity;
      const ref = db().collection(COLLECTION).doc(id);
      const doc = await ref.get();

      if (!doc.exists) {
        res.status(404).json({ error: 'Competitor not found' });
        return;
      }

      const now = new Date().toISOString();
      const positionId = randomUUID();
      const position = {
        id: positionId,
        ...data,
        updated_at: now,
        updated_by: identity.agent_id,
      };

      const existing = (doc.data()?.positions ?? []) as unknown[];
      await ref.update({
        positions: [...existing, position],
        updated_at: now,
      });

      auditLog(req, 'updated', id, doc.data()?.name ?? '', {
        sub_action: 'position_added',
        position_id: positionId,
      });
      res.status(201).json(position);
    } catch (error) {
      handleError(res, error);
    }
  },
);

// PUT /:id/positions/:positionId — Update a competitive position
competitorsRouter.put(
  '/:id/positions/:positionId',
  requirePermission('read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = UpdatePositionSchema.parse(req.body);
      const id = DocumentIdSchema.parse(req.params.id);
      const posId = req.params.positionId as string;
      const identity = req.apiKey!.agent_identity;
      const ref = db().collection(COLLECTION).doc(id);
      const doc = await ref.get();

      if (!doc.exists) {
        res.status(404).json({ error: 'Competitor not found' });
        return;
      }

      const now = new Date().toISOString();
      const positions = (doc.data()?.positions ?? []) as Array<Record<string, unknown> & { id: string }>;
      const idx = positions.findIndex((p) => p.id === posId);

      if (idx === -1) {
        res.status(404).json({ error: 'Position not found' });
        return;
      }

      positions[idx] = {
        ...positions[idx],
        ...data,
        id: posId,
        updated_at: now,
        updated_by: identity.agent_id,
      };

      await ref.update({ positions, updated_at: now });
      auditLog(req, 'updated', id, doc.data()?.name ?? '', {
        sub_action: 'position_updated',
        position_id: posId,
      });
      res.json(positions[idx]);
    } catch (error) {
      handleError(res, error);
    }
  },
);

// POST /:id/events — Add a timeline event
competitorsRouter.post(
  '/:id/events',
  requirePermission('read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = AddEventSchema.parse(req.body);
      const id = DocumentIdSchema.parse(req.params.id);
      const identity = req.apiKey!.agent_identity;
      const ref = db().collection(COLLECTION).doc(id);
      const doc = await ref.get();

      if (!doc.exists) {
        res.status(404).json({ error: 'Competitor not found' });
        return;
      }

      const now = new Date().toISOString();
      const eventId = randomUUID();
      const event = {
        id: eventId,
        ...data,
        origin: 'agent' as const,
        agent_identity: identity,
        created_at: now,
        created_by: identity.agent_id,
      };

      const existing = (doc.data()?.events ?? []) as unknown[];
      await ref.update({
        events: [...existing, event],
        updated_at: now,
      });

      auditLog(req, 'updated', id, doc.data()?.name ?? '', {
        sub_action: 'event_added',
        event_id: eventId,
        event_type: data.event_type,
      });
      res.status(201).json(event);
    } catch (error) {
      handleError(res, error);
    }
  },
);

// GET /:id/events — List events for a competitor
competitorsRouter.get(
  '/:id/events',
  requirePermission('read', 'read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const id = DocumentIdSchema.parse(req.params.id);
      const doc = await db().collection(COLLECTION).doc(id).get();

      if (!doc.exists) {
        res.status(404).json({ error: 'Competitor not found' });
        return;
      }

      const events = (doc.data()?.events ?? []) as Array<{ date: string }>;
      // Sort reverse-chronologically
      events.sort((a, b) => b.date.localeCompare(a.date));

      res.json({ total: events.length, events });
    } catch (error) {
      handleError(res, error);
    }
  },
);

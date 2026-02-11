import { Router, Response } from 'express';
import { ZodError } from 'zod';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';
import { CreateSourceSchema, ValidateSourceSchema } from '../schemas';
import { db } from '../lib/admin';

export const sourcesRouter = Router();

/** Adjust quality tier based on validation status. */
function adjustTier(current: number, status: string): number {
  switch (status) {
    case 'corroborated': return Math.max(1, current - 2);
    case 'human_verified': return Math.max(1, current - 3);
    case 'disputed': return Math.min(8, current + 2);
    default: return current;
  }
}

/** Map ZodError to 400 response, otherwise 500. */
function handleError(res: Response, error: unknown): void {
  if (error instanceof ZodError) {
    res.status(400).json({ error: 'Validation failed', issues: error.issues });
    return;
  }
  console.error('Source route error:', error);
  res.status(500).json({ error: 'Internal server error' });
}

// POST /:id/sources — Add a source to a research notebook
sourcesRouter.post(
  '/:id/sources',
  requirePermission('read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { notebook_id, ...sourceBody } = req.body;

      if (!notebook_id) {
        res.status(400).json({ error: 'notebook_id is required' });
        return;
      }

      const parsed = CreateSourceSchema.parse(sourceBody);
      const docRef = db().collection('research').doc(id as string);
      const doc = await docRef.get();

      if (!doc.exists) {
        res.status(404).json({ error: 'Research not found' });
        return;
      }

      const data = doc.data()!;
      const notebooks: Array<Record<string, unknown>> = data.notebooks ?? [];
      const nbIndex = notebooks.findIndex((nb) => nb.id === notebook_id);

      if (nbIndex === -1) {
        res.status(404).json({ error: 'Notebook not found' });
        return;
      }

      const sourceId = `src-${Date.now()}`;
      const source = {
        id: sourceId,
        ...parsed,
        validation_status: 'unverified' as const,
        validated_by: null,
        validated_at: null,
        validation_notes: '',
        created_at: new Date().toISOString(),
      };

      const sources: unknown[] = (notebooks[nbIndex].sources as unknown[]) ?? [];
      sources.push(source);
      notebooks[nbIndex].sources = sources;

      await docRef.update({ notebooks, updated_at: new Date().toISOString() });

      res.status(201).json(source);
    } catch (error) {
      handleError(res, error);
    }
  },
);

// PATCH /:id/sources/:sourceId — Update a source
sourcesRouter.patch(
  '/:id/sources/:sourceId',
  requirePermission('read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id, sourceId } = req.params;
      const updates = req.body;
      const allowedFields = ['title', 'url', 'publisher', 'quality_tier', 'notes'];

      const docRef = db().collection('research').doc(id as string);
      const doc = await docRef.get();

      if (!doc.exists) {
        res.status(404).json({ error: 'Research not found' });
        return;
      }

      const data = doc.data()!;
      const notebooks: Array<Record<string, unknown>> = data.notebooks ?? [];
      let isFound = false;

      for (const nb of notebooks) {
        const sources = (nb.sources as Array<Record<string, unknown>>) ?? [];
        const srcIndex = sources.findIndex((s) => s.id === sourceId);
        if (srcIndex !== -1) {
          for (const key of allowedFields) {
            if (key in updates) sources[srcIndex][key] = updates[key];
          }
          isFound = true;
          break;
        }
      }

      if (!isFound) {
        res.status(404).json({ error: 'Source not found' });
        return;
      }

      await docRef.update({ notebooks, updated_at: new Date().toISOString() });

      res.json({ message: 'Source updated' });
    } catch (error) {
      handleError(res, error);
    }
  },
);

// POST /:id/sources/:sourceId/validate — Record a validation event
sourcesRouter.post(
  '/:id/sources/:sourceId/validate',
  requirePermission('read_write', 'admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id, sourceId } = req.params;
      const parsed = ValidateSourceSchema.parse(req.body);

      const docRef = db().collection('research').doc(id as string);
      const doc = await docRef.get();

      if (!doc.exists) {
        res.status(404).json({ error: 'Research not found' });
        return;
      }

      const data = doc.data()!;
      const notebooks: Array<Record<string, unknown>> = data.notebooks ?? [];
      let oldTier = 0;
      let isFound = false;

      for (const nb of notebooks) {
        const sources = (nb.sources as Array<Record<string, unknown>>) ?? [];
        const srcIndex = sources.findIndex((s) => s.id === sourceId);
        if (srcIndex !== -1) {
          const src = sources[srcIndex];
          oldTier = (src.quality_tier as number) ?? 4;
          src.validation_status = parsed.validation_status;
          src.validated_by = req.apiKey?.agent_identity.agent_name ?? 'unknown';
          src.validated_at = new Date().toISOString();
          src.validation_notes = parsed.validation_notes;
          src.quality_tier = adjustTier(oldTier, parsed.validation_status);
          isFound = true;
          break;
        }
      }

      if (!isFound) {
        res.status(404).json({ error: 'Source not found' });
        return;
      }

      const newTier = adjustTier(oldTier, parsed.validation_status);
      await docRef.update({ notebooks, updated_at: new Date().toISOString() });

      // Audit log (fire-and-forget)
      db().collection('audit_logs').add({
        timestamp: new Date().toISOString(),
        actor: {
          user_id: req.apiKey?.agent_identity.agent_id ?? '',
          display_name: req.apiKey?.agent_identity.agent_name ?? 'unknown',
        },
        action: 'source_validated',
        target_type: 'source',
        target_id: sourceId,
        target_name: '',
        details: {
          research_id: id,
          validation_status: parsed.validation_status,
          old_tier: oldTier,
          new_tier: newTier,
        },
        category: 'research',
      }).catch(() => {});

      res.json({ message: 'Source validated', new_tier: newTier, new_status: parsed.validation_status });
    } catch (error) {
      handleError(res, error);
    }
  },
);

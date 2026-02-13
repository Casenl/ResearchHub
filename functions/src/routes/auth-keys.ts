import { Router, Response } from 'express';
import { randomBytes, createHash } from 'crypto';
import { ZodError } from 'zod';
import { db } from '../lib/admin';
import { AuthenticatedRequest, requirePermission } from '../middleware/auth';
import { CreateApiKeySchema, DocumentIdSchema } from '../schemas';

export const authKeysRouter = Router();

/** Helper: write an audit log entry (fire-and-forget). */
function auditLog(
  req: AuthenticatedRequest,
  action: 'api_key_created' | 'api_key_revoked',
  targetId: string,
  targetName: string,
  details: Record<string, unknown> = {},
): void {
  const identity = req.apiKey!.agent_identity;
  db().collection('audit_logs').add({
    timestamp: new Date().toISOString(),
    actor: { user_id: identity.agent_id, display_name: identity.agent_name },
    action,
    target_type: 'user',
    target_id: targetId,
    target_name: targetName,
    details,
    category: 'admin',
  }).catch(() => {});
}

// POST / -- Create a new API key
authKeysRouter.post(
  '/',
  requirePermission('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const data = CreateApiKeySchema.parse(req.body);
      const identity = req.apiKey!.agent_identity;
      const now = new Date().toISOString();

      const plaintext = `rh_${randomBytes(32).toString('hex')}`;
      const keyHash = createHash('sha256').update(plaintext).digest('hex');

      const record = {
        name: data.name,
        key_hash: keyHash,
        permissions: data.permissions,
        agent_identity: data.agent_identity,
        created_by: identity.agent_id,
        created_at: now,
        last_used_at: null,
        is_active: true,
        expires_at: data.expires_at,
      };

      const ref = await db().collection('api-keys').add(record);
      auditLog(req, 'api_key_created', ref.id, data.name, { permissions: data.permissions });

      res.status(201).json({
        key_id: ref.id,
        plaintext_key: plaintext,
        name: data.name,
        permissions: data.permissions,
        agent_identity: data.agent_identity,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({ error: 'Validation failed', issues: error.issues });
        return;
      }
      console.error('Error creating API key:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// GET / -- List all API keys (never expose key_hash)
authKeysRouter.get(
  '/',
  requirePermission('admin'),
  async (_req: AuthenticatedRequest, res: Response) => {
    try {
      const snapshot = await db()
        .collection('api-keys')
        .orderBy('created_at', 'desc')
        .get();

      const keys = snapshot.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          name: d.name,
          permissions: d.permissions,
          agent_identity: d.agent_identity,
          created_by: d.created_by,
          created_at: d.created_at,
          last_used_at: d.last_used_at,
          is_active: d.is_active,
          expires_at: d.expires_at,
        };
      });

      res.json(keys);
    } catch (error) {
      console.error('Error listing API keys:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

// DELETE /:id -- Revoke an API key
authKeysRouter.delete(
  '/:id',
  requirePermission('admin'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const keyId = DocumentIdSchema.parse(req.params.id);
      const ref = db().collection('api-keys').doc(keyId);
      const doc = await ref.get();

      if (!doc.exists) {
        res.status(404).json({ error: 'API key not found' });
        return;
      }

      await ref.update({ is_active: false });
      const data = doc.data()!;
      auditLog(req, 'api_key_revoked', keyId, data.name, { permissions: data.permissions });

      res.json({ message: 'Key revoked' });
    } catch (error) {
      console.error('Error revoking API key:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },
);

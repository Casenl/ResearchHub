import { createHash } from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from '../lib/admin';

/** Shape attached to req after auth middleware validates the API key. */
export interface ApiKeyInfo {
  id: string;
  name: string;
  permissions: 'read' | 'read_write' | 'admin';
  agent_identity: {
    agent_id: string;
    agent_name: string;
    agent_version: string;
    run_id: string;
  };
}

/** Extended Express Request with authenticated API key data. */
export interface AuthenticatedRequest extends Request {
  apiKey?: ApiKeyInfo;
}

/** Validate the API key from the Authorization header. */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header. Use: Bearer <api-key>' });
    return;
  }

  const plaintextKey = authHeader.slice(7);
  if (!plaintextKey) {
    res.status(401).json({ error: 'Empty API key' });
    return;
  }

  const keyHash = createHash('sha256').update(plaintextKey).digest('hex');

  try {
    const snapshot = await db()
      .collection('api-keys')
      .where('key_hash', '==', keyHash)
      .where('is_active', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      res.status(401).json({ error: 'Invalid or revoked API key' });
      return;
    }

    const doc = snapshot.docs[0];
    const data = doc.data();

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      res.status(401).json({ error: 'API key has expired' });
      return;
    }

    // Attach key info to request
    req.apiKey = {
      id: doc.id,
      name: data.name,
      permissions: data.permissions,
      agent_identity: data.agent_identity,
    };

    // Update last_used_at (fire-and-forget)
    doc.ref.update({ last_used_at: new Date().toISOString() }).catch(() => {});

    // Log API access (fire-and-forget)
    db().collection('audit_logs').add({
      timestamp: new Date().toISOString(),
      actor: {
        user_id: data.agent_identity.agent_id,
        display_name: data.agent_identity.agent_name,
      },
      action: 'api_access',
      target_type: 'research',
      target_id: '',
      target_name: `${req.method} ${req.path}`,
      details: { key_name: data.name, method: req.method, path: req.path },
      category: 'api',
    }).catch(() => {});

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication service unavailable' });
  }
}

/** Require specific permission level. Use after authMiddleware. */
export function requirePermission(...allowed: Array<'read' | 'read_write' | 'admin'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.apiKey) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    if (!allowed.includes(req.apiKey.permissions)) {
      res.status(403).json({ error: `Insufficient permissions. Required: ${allowed.join(' or ')}` });
      return;
    }
    next();
  };
}

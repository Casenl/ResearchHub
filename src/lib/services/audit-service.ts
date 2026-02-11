import { getAdminFirestore } from '@/lib/firebase-admin';
import type { ActivityAction, ActivityCategory, ActivityTargetType } from '@/types';

interface AuditLogParams {
  actor_id: string;
  actor_name: string;
  action: ActivityAction;
  target_type: ActivityTargetType;
  target_id: string;
  target_name: string;
  category: ActivityCategory;
  details?: Record<string, unknown>;
}

/** Create an immutable audit log entry. */
export async function createAuditLog(params: AuditLogParams): Promise<string> {
  const db = getAdminFirestore();
  const entry = {
    timestamp: new Date().toISOString(),
    actor: {
      user_id: params.actor_id,
      display_name: params.actor_name,
    },
    action: params.action,
    target_type: params.target_type,
    target_id: params.target_id,
    target_name: params.target_name,
    details: params.details ?? {},
    category: params.category,
  };

  try {
    const docRef = await db.collection('audit_logs').add(entry);
    return docRef.id;
  } catch (error) {
    console.error('Audit log creation failed:', error);
    throw error;
  }
}

/** Log an API access event. Convenience wrapper for agent/API calls. */
export async function logApiAccess(
  agent_id: string,
  agent_name: string,
  action: string,
  resource_type: ActivityTargetType,
  resource_id: string,
): Promise<void> {
  await createAuditLog({
    actor_id: agent_id,
    actor_name: agent_name,
    action: 'api_access',
    target_type: resource_type,
    target_id: resource_id,
    target_name: action,
    category: 'api',
    details: { access_type: action },
  });
}

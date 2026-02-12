import { createHash, randomBytes } from 'crypto';
import { getAdminFirestore } from '@/lib/firebase-admin';
import type { ApiKey, ApiKeyPermission, AgentIdentity } from '@/types';

/** Hash an API key using SHA-256. */
function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/** Generate a new API key. Returns the plaintext key (shown once) and the stored record. */
export async function createApiKey(params: {
  name: string;
  permissions: ApiKeyPermission;
  agent_identity: AgentIdentity;
  created_by: string;
  expires_at?: string | null;
}): Promise<{ plaintext_key: string; key_id: string }> {
  const db = getAdminFirestore();
  const plaintext = `rh_${randomBytes(32).toString('hex')}`;
  const keyHash = hashKey(plaintext);

  const record: Omit<ApiKey, 'id'> = {
    name: params.name,
    key_hash: keyHash,
    permissions: params.permissions,
    agent_identity: params.agent_identity,
    created_by: params.created_by,
    created_at: new Date().toISOString(),
    last_used_at: null,
    is_active: true,
    expires_at: params.expires_at ?? null,
  };

  try {
    const docRef = await db.collection('api-keys').add(record);
    return { plaintext_key: plaintext, key_id: docRef.id };
  } catch (error) {
    console.error('API key creation failed:', error);
    throw error;
  }
}

/** Validate an API key. Returns the ApiKey record if valid, null if invalid/expired/revoked. */
export async function validateApiKey(plaintextKey: string): Promise<(ApiKey & { id: string }) | null> {
  const db = getAdminFirestore();
  const keyHash = hashKey(plaintextKey);

  try {
    const snapshot = await db.collection('api-keys')
      .where('key_hash', '==', keyHash)
      .where('is_active', '==', true)
      .limit(1)
      .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const data = doc.data() as Omit<ApiKey, 'id'>;

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return null;
    }

    // Update last_used_at
    await doc.ref.update({ last_used_at: new Date().toISOString() });

    return { id: doc.id, ...data };
  } catch (error) {
    console.error('API key validation failed:', error);
    return null;
  }
}

/** Revoke an API key by ID. */
export async function revokeApiKey(keyId: string): Promise<void> {
  const db = getAdminFirestore();
  try {
    await db.collection('api-keys').doc(keyId).update({ is_active: false });
  } catch (error) {
    console.error('API key revocation failed:', error);
    throw error;
  }
}

/** List all API keys (metadata only, never the hash). */
export async function listApiKeys(): Promise<Array<Omit<ApiKey, 'key_hash'> & { id: string }>> {
  const db = getAdminFirestore();
  try {
    const snapshot = await db.collection('api-keys').orderBy('created_at', 'desc').get();
    return snapshot.docs.map(doc => {
      const { key_hash: _key_hash, ...rest } = doc.data() as Omit<ApiKey, 'id'>;
      return { id: doc.id, ...rest } as Omit<ApiKey, 'key_hash'> & { id: string };
    });
  } catch (error) {
    console.error('API key listing failed:', error);
    throw error;
  }
}

import { describe, it, expect, beforeEach } from 'vitest';
import { resetStore, getAllDocs } from './helpers/mock-admin';
import { createAuditLog, logApiAccess } from '../audit-service';

beforeEach(() => {
  resetStore();
});

// ---------------------------------------------------------------------------
// createAuditLog
// ---------------------------------------------------------------------------
describe('createAuditLog', () => {
  it('writes an audit entry with the correct shape', async () => {
    const id = await createAuditLog({
      actor_id: 'agent-1',
      actor_name: 'Test Agent',
      action: 'created',
      target_type: 'research',
      target_id: 'research-1',
      target_name: 'Test Research',
      category: 'api',
    });

    expect(id).toMatch(/^mock-id-/);
    const docs = getAllDocs('audit_logs');
    expect(docs).toHaveLength(1);

    const entry = docs[0].data;
    expect(entry.actor).toEqual({ user_id: 'agent-1', display_name: 'Test Agent' });
    expect(entry.action).toBe('created');
    expect(entry.target_type).toBe('research');
    expect(entry.target_id).toBe('research-1');
    expect(entry.target_name).toBe('Test Research');
    expect(entry.category).toBe('api');
  });

  it('includes a timestamp', async () => {
    await createAuditLog({
      actor_id: 'agent-1',
      actor_name: 'Agent',
      action: 'updated',
      target_type: 'research',
      target_id: 'r-1',
      target_name: 'R',
      category: 'research',
    });

    const docs = getAllDocs('audit_logs');
    expect(docs[0].data.timestamp).toBeDefined();
    // Should be a valid ISO string
    expect(() => new Date(docs[0].data.timestamp as string)).not.toThrow();
  });

  it('defaults details to empty object', async () => {
    await createAuditLog({
      actor_id: 'agent-1',
      actor_name: 'Agent',
      action: 'created',
      target_type: 'research',
      target_id: 'r-1',
      target_name: 'R',
      category: 'api',
    });

    const docs = getAllDocs('audit_logs');
    expect(docs[0].data.details).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// logApiAccess
// ---------------------------------------------------------------------------
describe('logApiAccess', () => {
  it('creates an audit log with "api" category and "api_access" action', async () => {
    await logApiAccess('agent-1', 'Test Agent', 'read_research', 'research', 'r-1');

    const docs = getAllDocs('audit_logs');
    expect(docs).toHaveLength(1);
    expect(docs[0].data.action).toBe('api_access');
    expect(docs[0].data.category).toBe('api');
    expect(docs[0].data.target_type).toBe('research');
    expect(docs[0].data.details).toEqual({ access_type: 'read_research' });
  });
});

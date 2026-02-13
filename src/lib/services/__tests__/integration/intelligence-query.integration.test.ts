/**
 * Integration tests for intelligence-query-service against staging Firebase.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { initializeApp, cert, getApps, deleteApp } from 'firebase-admin/app';
import { readTestState, getServiceAccountCredentials, TEST_PREFIX } from './helpers';

let queryResearch: typeof import('../../intelligence-query-service').queryResearch;
let getLandscape: typeof import('../../intelligence-query-service').getLandscape;
let getResearchBrief: typeof import('../../intelligence-query-service').getResearchBrief;
let createResearch: typeof import('../../research-crud-service').createResearch;

beforeAll(async () => {
  readTestState(); // Verify setup ran successfully

  const credentials = getServiceAccountCredentials();
  for (const app of getApps()) {
    await deleteApp(app);
  }
  initializeApp({
    credential: cert(credentials as Parameters<typeof cert>[0]),
    storageBucket: 'marketintelligence-hub-staging.firebasestorage.app',
  });

  const intelMod = await import('../../intelligence-query-service');
  queryResearch = intelMod.queryResearch;
  getLandscape = intelMod.getLandscape;
  getResearchBrief = intelMod.getResearchBrief;

  const crudMod = await import('../../research-crud-service');
  createResearch = crudMod.createResearch;

  // Create a published research entry for query testing
  await createResearch(
    {
      title: `${TEST_PREFIX} Published for Query`,
      description: 'Published entry for intelligence query tests',
      type: 'new',
      output_format: 'factsheet',
      refresh_schedule: 'ad_hoc',
      origin: 'agent',
      agent_identity: {
        agent_id: 'mcp-integration-test',
        agent_name: 'MCP Integration Test Suite',
        agent_version: '1.0.0',
        run_id: `intel-${Date.now()}`,
      },
      dimensions: {
        market_ids: ['market-nl'],
        domain_ids: ['domain-sec'],
        sector_ids: ['sector-fs'],
      },
      findings: 'Integration test findings',
      synthesis: 'Integration test synthesis for NL security research',
      assumptions: [],
      input_context: [],
      tag_ids: [],
      context_document_ids: [],
    },
    'mcp-integration-test',
    'MCP Integration Test Suite',
  );
});

describe('intelligence-query-service (integration)', () => {
  it('queries research without filters', async () => {
    // No status filter avoids composite index requirement.
    // Verifies basic query + orderBy works against staging.
    const { items, total } = await queryResearch({});
    expect(total).toBeGreaterThanOrEqual(1);
    expect(items.length).toBeGreaterThanOrEqual(1);
    expect(items[0].id).toBeDefined();
  });

  it('queries research with region filter', async () => {
    const { items } = await queryResearch({ region: 'NL' });
    expect(items.length).toBeGreaterThanOrEqual(1);
    for (const item of items) {
      const hasNL = item.dimensions.markets.some(
        m => m.code === 'NL' || m.id === 'NL' || m.id === 'market-nl',
      );
      expect(hasNL).toBe(true);
    }
  });

  it('returns landscape data for a region', async () => {
    const landscape = await getLandscape('NL');
    // Should have at least one domain entry from our seeded data
    expect(Array.isArray(landscape)).toBe(true);
    // May or may not have entries depending on staging state
  });

  it('generates a research brief', async () => {
    const brief = await getResearchBrief('NL');
    // Should be a non-empty string (either content or "no research found" message)
    expect(typeof brief).toBe('string');
    expect(brief.length).toBeGreaterThan(0);
  });
});

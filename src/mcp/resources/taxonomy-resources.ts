/**
 * MCP resources for taxonomy and configuration data.
 * Exposes read-only access to markets, domains, sectors, and trust-tier definitions.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { MARKETS } from '@/data/markets';
import { DOMAINS } from '@/data/domains';
import { SECTORS } from '@/data/sectors';
import { TRUST_TIER_DEFINITIONS } from '@/lib/trust-tiers';

export function registerTaxonomyResources(server: McpServer): void {
  server.resource(
    'taxonomy-markets',
    'researchhub://taxonomy/markets',
    async (uri) => ({
      contents: [{
        uri: uri.href,
        mimeType: 'application/json',
        text: JSON.stringify(MARKETS),
      }],
    })
  );

  server.resource(
    'taxonomy-domains',
    'researchhub://taxonomy/domains',
    async (uri) => ({
      contents: [{
        uri: uri.href,
        mimeType: 'application/json',
        text: JSON.stringify(DOMAINS),
      }],
    })
  );

  server.resource(
    'taxonomy-sectors',
    'researchhub://taxonomy/sectors',
    async (uri) => ({
      contents: [{
        uri: uri.href,
        mimeType: 'application/json',
        text: JSON.stringify(SECTORS),
      }],
    })
  );

  server.resource(
    'config-trust-tiers',
    'researchhub://config/trust-tiers',
    async (uri) => ({
      contents: [{
        uri: uri.href,
        mimeType: 'application/json',
        text: JSON.stringify(TRUST_TIER_DEFINITIONS),
      }],
    })
  );
}

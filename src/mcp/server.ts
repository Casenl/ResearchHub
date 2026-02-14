import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerResearchTools } from './tools/research-tools';
import { registerIntelligenceTools } from './tools/intelligence-tools';
import { registerSourceTools } from './tools/source-tools';
import { registerUtilityTools } from './tools/utility-tools';
import { registerLegislationTools } from './tools/legislation-tools';
import { registerTaxonomyResources } from './resources/taxonomy-resources';

const server = new McpServer({
  name: 'researchhub',
  version: '1.0.0',
});

// Register all tools and resources
registerResearchTools(server);
registerIntelligenceTools(server);
registerSourceTools(server);
registerUtilityTools(server);
registerLegislationTools(server);
registerTaxonomyResources(server);

// Connect via stdio transport
async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error('MCP server failed to start:', error);
  process.exit(1);
});

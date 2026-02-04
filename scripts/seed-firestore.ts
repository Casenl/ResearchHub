/**
 * Seed script: populates Firestore with all seed/mock data.
 *
 * Usage:
 *   npm run seed
 *
 * Requires:
 *   - Service account key JSON at project root
 *   - firebase-admin package installed (devDependency)
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// ---------------------------------------------------------------------------
// Seed data imports
// ---------------------------------------------------------------------------

import { MARKETS } from "../src/data/markets";
import { DOMAINS } from "../src/data/domains";
import { SECTORS } from "../src/data/sectors";
import { SYSTEM_TAGS } from "../src/data/tags";
import { MOCK_RESEARCH } from "../src/data/mock-research";
import { MOCK_CONTEXT_DOCUMENTS } from "../src/data/mock-context-documents";
import { AI_TOOL_PROFILES } from "../src/data/ai-tool-profiles";
import { DEFAULT_PROMPT_TEMPLATES } from "../src/data/prompt-templates";
import { DEFAULT_CONTEXT_RULES } from "../src/data/context-rules";
import { MOCK_ACTIVITY_LOG } from "../src/data/mock-activity";
import { MOCK_API_USAGE } from "../src/data/mock-usage";

// ---------------------------------------------------------------------------
// Firebase Admin init (bypasses security rules)
// ---------------------------------------------------------------------------

function findServiceAccountKey(): string {
  const cwd = process.cwd();
  const candidates = [
    resolve(cwd, "marketintelligence-hub-firebase-adminsdk-fbsvc-6dc224a6ce.json"),
    resolve(import.meta.dirname ?? ".", "..", "marketintelligence-hub-firebase-adminsdk-fbsvc-6dc224a6ce.json"),
  ];
  for (const p of candidates) {
    try {
      readFileSync(p, "utf-8"); // test if readable
      return p;
    } catch {
      // try next
    }
  }
  throw new Error(
    "Service account key not found. Expected at project root:\n" +
    "  marketintelligence-hub-firebase-adminsdk-fbsvc-6dc224a6ce.json"
  );
}

const keyPath = findServiceAccountKey();
console.log(`Using service account key: ${keyPath}`);

const serviceAccount = JSON.parse(readFileSync(keyPath, "utf-8"));
const app = initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore(app);

// ---------------------------------------------------------------------------
// Mock users (matches author IDs in mock-research.ts)
// ---------------------------------------------------------------------------

const MOCK_USERS = [
  {
    id: "user-1",
    name: "Joris van den Berg",
    email: "joris@itq.nl",
    role: "admin" as const,
    domain_ids: ["domain-sec", "domain-hc"],
    business_unit: "Security BU",
    monthly_token_budget: 100000,
  },
  {
    id: "user-2",
    name: "Marloes de Vries",
    email: "marloes@itq.nl",
    role: "researcher" as const,
    domain_ids: ["domain-sec", "domain-ai"],
    business_unit: "Cloud BU",
    monthly_token_budget: 75000,
  },
  {
    id: "user-3",
    name: "Thomas Bakker",
    email: "thomas@itq.nl",
    role: "researcher" as const,
    domain_ids: ["domain-dw"],
    business_unit: "Digital Workspace BU",
    monthly_token_budget: 50000,
  },
  {
    id: "user-4",
    name: "Lisa Jansen",
    email: "lisa@itq.nl",
    role: "researcher" as const,
    domain_ids: ["domain-ai"],
    business_unit: "AI BU",
    monthly_token_budget: 50000,
  },
  {
    id: "user-5",
    name: "Peter van Dijk",
    email: "peter@itq.nl",
    role: "viewer" as const,
    domain_ids: [],
    business_unit: "Management",
  },
];

// ---------------------------------------------------------------------------
// Seeding functions
// ---------------------------------------------------------------------------

async function seedTaxonomy() {
  console.log("Seeding taxonomy...");
  await db.doc("taxonomy/markets").set({ items: MARKETS });
  await db.doc("taxonomy/domains").set({ items: DOMAINS });
  await db.doc("taxonomy/sectors").set({ items: SECTORS });
  await db.doc("taxonomy/tags").set({ items: SYSTEM_TAGS });
  console.log("  ✓ Taxonomy seeded (markets, domains, sectors, tags)");
}

async function seedUsers() {
  console.log("Seeding users...");
  for (const user of MOCK_USERS) {
    const { id, ...data } = user;
    await db.doc(`users/${id}`).set(data);
  }
  console.log(`  ✓ ${MOCK_USERS.length} users seeded`);
}

async function seedResearch() {
  console.log("Seeding research...");
  for (const research of MOCK_RESEARCH) {
    const { id, ...data } = research;
    await db.doc(`research/${id}`).set(data);
  }
  console.log(`  ✓ ${MOCK_RESEARCH.length} research items seeded`);
}

async function seedContextDocuments() {
  console.log("Seeding context documents...");
  for (const ctxDoc of MOCK_CONTEXT_DOCUMENTS) {
    const { id, ...data } = ctxDoc;
    await db.doc(`context-documents/${id}`).set(data);
  }
  console.log(`  ✓ ${MOCK_CONTEXT_DOCUMENTS.length} context documents seeded`);
}

async function seedAIToolProfiles() {
  console.log("Seeding AI tool profiles...");
  for (const tool of AI_TOOL_PROFILES) {
    const { id, ...data } = tool;
    await db.doc(`ai-tool-profiles/${id}`).set(data);
  }
  console.log(`  ✓ ${AI_TOOL_PROFILES.length} AI tool profiles seeded`);
}

async function seedPromptTemplates() {
  console.log("Seeding prompt templates...");
  for (const template of DEFAULT_PROMPT_TEMPLATES) {
    const { id, ...data } = template;
    await db.doc(`prompt-templates/${id}`).set(data);
  }
  console.log(`  ✓ ${DEFAULT_PROMPT_TEMPLATES.length} prompt templates seeded`);
}

async function seedContextRules() {
  console.log("Seeding context rules...");
  for (const rule of DEFAULT_CONTEXT_RULES) {
    const { id, ...data } = rule;
    await db.doc(`context-rules/${id}`).set(data);
  }
  console.log(`  ✓ ${DEFAULT_CONTEXT_RULES.length} context rules seeded`);
}

async function seedActivityLog() {
  console.log("Seeding activity log...");
  const batch = db.batch();
  for (const entry of MOCK_ACTIVITY_LOG) {
    const { id, ...data } = entry;
    batch.set(db.collection("activity-log").doc(id), data);
  }
  await batch.commit();
  console.log(`  ✓ ${MOCK_ACTIVITY_LOG.length} activity log entries seeded`);
}

async function seedApiUsage() {
  console.log("Seeding API usage...");
  const batch = db.batch();
  for (const entry of MOCK_API_USAGE) {
    const { id, ...data } = entry;
    batch.set(db.collection("api-usage").doc(id), data);
  }
  await batch.commit();
  console.log(`  ✓ ${MOCK_API_USAGE.length} API usage entries seeded`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n🌱 Seeding Firestore...\n");
  console.log(`Project: ${serviceAccount.project_id}`);
  console.log("");

  await seedTaxonomy();
  await seedUsers();
  await seedResearch();
  await seedContextDocuments();
  await seedAIToolProfiles();
  await seedPromptTemplates();
  await seedContextRules();
  await seedActivityLog();
  await seedApiUsage();

  console.log("\n✅ All seed data written to Firestore.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ Seeding failed:", err);
  process.exit(1);
});

/**
 * Seed script: populates Firestore with all seed/mock data.
 *
 * Usage:
 *   npx tsx scripts/seed-firestore.ts
 *
 * Requires:
 *   - NEXT_PUBLIC_FIREBASE_* env vars set (via .env.local or shell)
 *   - firebase package installed
 */

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  collection,
  writeBatch,
} from "firebase/firestore";

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
// Firebase init (reuse .env.local variables)
// ---------------------------------------------------------------------------

function getConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };
}

const app = getApps().length > 0 ? getApp() : initializeApp(getConfig());
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
  await setDoc(doc(db, "taxonomy", "markets"), { items: MARKETS });
  await setDoc(doc(db, "taxonomy", "domains"), { items: DOMAINS });
  await setDoc(doc(db, "taxonomy", "sectors"), { items: SECTORS });
  await setDoc(doc(db, "taxonomy", "tags"), { items: SYSTEM_TAGS });
  console.log("  ✓ Taxonomy seeded (markets, domains, sectors, tags)");
}

async function seedUsers() {
  console.log("Seeding users...");
  for (const user of MOCK_USERS) {
    const { id, ...data } = user;
    await setDoc(doc(db, "users", id), data);
  }
  console.log(`  ✓ ${MOCK_USERS.length} users seeded`);
}

async function seedResearch() {
  console.log("Seeding research...");
  for (const research of MOCK_RESEARCH) {
    const { id, ...data } = research;
    await setDoc(doc(db, "research", id), data);
  }
  console.log(`  ✓ ${MOCK_RESEARCH.length} research items seeded`);
}

async function seedContextDocuments() {
  console.log("Seeding context documents...");
  for (const ctxDoc of MOCK_CONTEXT_DOCUMENTS) {
    const { id, ...data } = ctxDoc;
    await setDoc(doc(db, "context-documents", id), data);
  }
  console.log(`  ✓ ${MOCK_CONTEXT_DOCUMENTS.length} context documents seeded`);
}

async function seedAIToolProfiles() {
  console.log("Seeding AI tool profiles...");
  for (const tool of AI_TOOL_PROFILES) {
    const { id, ...data } = tool;
    await setDoc(doc(db, "ai-tool-profiles", id), data);
  }
  console.log(`  ✓ ${AI_TOOL_PROFILES.length} AI tool profiles seeded`);
}

async function seedPromptTemplates() {
  console.log("Seeding prompt templates...");
  for (const template of DEFAULT_PROMPT_TEMPLATES) {
    const { id, ...data } = template;
    await setDoc(doc(db, "prompt-templates", id), data);
  }
  console.log(`  ✓ ${DEFAULT_PROMPT_TEMPLATES.length} prompt templates seeded`);
}

async function seedContextRules() {
  console.log("Seeding context rules...");
  for (const rule of DEFAULT_CONTEXT_RULES) {
    const { id, ...data } = rule;
    await setDoc(doc(db, "context-rules", id), data);
  }
  console.log(`  ✓ ${DEFAULT_CONTEXT_RULES.length} context rules seeded`);
}

async function seedActivityLog() {
  console.log("Seeding activity log...");
  const batch = writeBatch(db);
  for (const entry of MOCK_ACTIVITY_LOG) {
    const { id, ...data } = entry;
    batch.set(doc(collection(db, "activity-log"), id), data);
  }
  await batch.commit();
  console.log(`  ✓ ${MOCK_ACTIVITY_LOG.length} activity log entries seeded`);
}

async function seedApiUsage() {
  console.log("Seeding API usage...");
  const batch = writeBatch(db);
  for (const entry of MOCK_API_USAGE) {
    const { id, ...data } = entry;
    batch.set(doc(collection(db, "api-usage"), id), data);
  }
  await batch.commit();
  console.log(`  ✓ ${MOCK_API_USAGE.length} API usage entries seeded`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n🌱 Seeding Firestore...\n");
  console.log(`Project: ${getConfig().projectId}`);
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

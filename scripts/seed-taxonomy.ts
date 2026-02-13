#!/usr/bin/env npx tsx
/**
 * Seed Firestore taxonomy collections (markets, domains, sectors, tags).
 *
 * Usage:
 *   npx tsx scripts/seed-taxonomy.ts                    # seeds production
 *   npx tsx scripts/seed-taxonomy.ts --project staging  # seeds staging
 *
 * Requires a service account key:
 *   - Production: FIREBASE_ADMIN_SDK_PATH env var or default key at project root
 *   - Staging:    uses staging SA key
 *
 * Skips collections that already have data (safe to re-run).
 * Use --force to overwrite existing data.
 */

import path from "path";

// Parse args
const args = process.argv.slice(2);
const isStaging = args.includes("--project") && args[args.indexOf("--project") + 1] === "staging";
const force = args.includes("--force");

// Determine SA key path
const defaultProdKey = "marketintelligence-hub-firebase-adminsdk-fbsvc-6dc224a6ce.json";
const defaultStagingKey = "marketintelligence-hub-staging-sa-key.json";
const keyPath = process.env.FIREBASE_ADMIN_SDK_PATH
  ?? (isStaging ? defaultStagingKey : defaultProdKey);

const resolvedKeyPath = path.resolve(process.cwd(), keyPath);

async function main() {
  // Dynamic imports to avoid module-level side effects
  const { initializeApp, cert } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");

  const { MARKETS } = await import("../src/data/markets");
  const { DOMAINS } = await import("../src/data/domains");
  const { SECTORS } = await import("../src/data/sectors");
  const { SYSTEM_TAGS } = await import("../src/data/tags");

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const serviceAccount = require(resolvedKeyPath);

  const app = initializeApp({
    credential: cert(serviceAccount),
  });
  const db = getFirestore(app);

  const project = isStaging ? "staging" : "production";
  console.log(`Seeding taxonomy to ${project} (${serviceAccount.project_id})...`);

  const collections: { docId: string; label: string; items: unknown[] }[] = [
    { docId: "markets", label: "Markets", items: MARKETS },
    { docId: "domains", label: "Domains", items: DOMAINS },
    { docId: "sectors", label: "Sectors", items: SECTORS },
    { docId: "tags", label: "Tags", items: SYSTEM_TAGS },
  ];

  for (const { docId, label, items } of collections) {
    const ref = db.collection("taxonomy").doc(docId);
    const snapshot = await ref.get();

    if (snapshot.exists && !force) {
      const existingCount = (snapshot.data()?.items ?? []).length;
      console.log(`  ${label}: already has ${existingCount} items (skipped, use --force to overwrite)`);
      continue;
    }

    await ref.set({ items });
    console.log(`  ${label}: seeded ${items.length} items`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

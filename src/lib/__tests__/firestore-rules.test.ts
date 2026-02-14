import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Verify that all Firestore collections used in the codebase have
 * matching rules defined in firestore.rules.
 *
 * Catches the case where a new collection (e.g. competitors) is added
 * to the app code but not to the security rules — causing
 * "Missing or insufficient permissions" errors in production.
 */

const RULES_PATH = path.resolve(__dirname, "../../../firestore.rules");

/** All Firestore collections used by the application. */
const EXPECTED_COLLECTIONS = [
  "research",
  "context-documents",
  "competitors",
  "legislation",
  "api-keys",
  "file-attachments",
  "audit_logs",
  "taxonomy",
  "users",
  "prompt-templates",
  "ai-tool-profiles",
  "prompt-assignments",
  "context-rules",
  "app-settings",
  "api-usage",
];

describe("Firestore rules coverage", () => {
  const rulesContent = fs.readFileSync(RULES_PATH, "utf-8");

  it("firestore.rules file exists", () => {
    expect(fs.existsSync(RULES_PATH)).toBe(true);
  });

  for (const collection of EXPECTED_COLLECTIONS) {
    it(`has rules for "${collection}" collection`, () => {
      // Match patterns like: match /competitors/{competitorId}
      // or match /context-documents/{docId}
      const pattern = new RegExp(`match\\s+/${collection.replace("-", "\\-")}/\\{`);
      expect(
        pattern.test(rulesContent),
        `Missing Firestore rules for collection "${collection}" in firestore.rules.\n` +
          "Add a match rule for this collection before deploying."
      ).toBe(true);
    });
  }
});

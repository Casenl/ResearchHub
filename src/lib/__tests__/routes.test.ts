import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Verify that all expected route pages are committed to git.
 *
 * Locally this always passes (files exist on disk). In CI it catches pages
 * that were created locally but never committed — the exact class of bug
 * that caused a 404 on /settings in production.
 *
 * When adding a new route, add its page.tsx path here.
 */

const APP_DIR = path.resolve(__dirname, "../../app");

/** Map of route path -> page.tsx location relative to src/app/ */
const EXPECTED_ROUTES: Record<string, string> = {
  "/login": "login/page.tsx",
  "/": "(dashboard)/page.tsx",
  "/research": "(dashboard)/research/page.tsx",
  "/research/new": "(dashboard)/research/new/page.tsx",
  "/research/[id]": "(dashboard)/research/[id]/page.tsx",
  "/context-library": "(dashboard)/context-library/page.tsx",
  "/context-library/new": "(dashboard)/context-library/new/page.tsx",
  "/context-library/[id]": "(dashboard)/context-library/[id]/page.tsx",
  "/competitors": "(dashboard)/competitors/page.tsx",
  "/competitors/new": "(dashboard)/competitors/new/page.tsx",
  "/competitors/[id]": "(dashboard)/competitors/[id]/page.tsx",
  "/settings": "(dashboard)/settings/page.tsx",
  "/admin/taxonomy": "(dashboard)/admin/taxonomy/page.tsx",
  "/admin/users": "(dashboard)/admin/users/page.tsx",
  "/admin/api-keys": "(dashboard)/admin/api-keys/page.tsx",
  "/admin/prompts": "(dashboard)/admin/prompts/page.tsx",
  "/admin/context-rules": "(dashboard)/admin/context-rules/page.tsx",
  "/admin/review-queue": "(dashboard)/admin/review-queue/page.tsx",
  "/admin/activity": "(dashboard)/admin/activity/page.tsx",
  "/admin/usage": "(dashboard)/admin/usage/page.tsx",
  "/admin/coverage": "(dashboard)/admin/coverage/page.tsx",
  "/admin/settings": "(dashboard)/admin/settings/page.tsx",
  "/admin/legislation": "(dashboard)/admin/legislation/page.tsx",
};

describe("Route pages exist", () => {
  for (const [route, pagePath] of Object.entries(EXPECTED_ROUTES)) {
    it(`${route} -> ${pagePath}`, () => {
      const fullPath = path.join(APP_DIR, pagePath);
      expect(
        fs.existsSync(fullPath),
        `Missing page file for route "${route}": ${fullPath}\n` +
          "If this file exists locally, it may not be committed to git."
      ).toBe(true);
    });
  }
});

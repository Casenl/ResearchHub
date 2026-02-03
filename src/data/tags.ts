/**
 * System tag seed data for the ITQ Market Intelligence Portal.
 * System tags are predefined tags used to categorise and filter research content.
 * Users may also create custom (free) tags at runtime; these are the defaults.
 */

import type { Tag } from "@/types";

export const SYSTEM_TAGS: Tag[] = [
  {
    id: "tag-nis2",
    name: "NIS2",
    type: "system",
  },
  {
    id: "tag-dora",
    name: "DORA",
    type: "system",
  },
  {
    id: "tag-gdpr",
    name: "GDPR",
    type: "system",
  },
  {
    id: "tag-cra",
    name: "Cyber Resilience Act",
    type: "system",
  },
  {
    id: "tag-eu-ai-act",
    name: "EU AI Act",
    type: "system",
  },
  {
    id: "tag-zero-trust",
    name: "Zero Trust",
    type: "system",
  },
  {
    id: "tag-cloud-native",
    name: "Cloud-native",
    type: "system",
  },
  {
    id: "tag-edge-computing",
    name: "Edge Computing",
    type: "system",
  },
  {
    id: "tag-ai-ml",
    name: "AI/ML",
    type: "system",
  },
  {
    id: "tag-talent-labour",
    name: "Talent & Labour Market",
    type: "system",
  },
];

/**
 * Retrieve a system tag by its ID.
 */
export function getTagById(id: string): Tag | undefined {
  return SYSTEM_TAGS.find((tag) => tag.id === id);
}

/**
 * Retrieve a system tag by its name (case-insensitive).
 */
export function getTagByName(name: string): Tag | undefined {
  const lower = name.toLowerCase();
  return SYSTEM_TAGS.find((tag) => tag.name.toLowerCase() === lower);
}

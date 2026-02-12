import { DOMAINS } from "@/data/domains";

import type { User, UserRole } from "@/types";

// =============================================================================
// Constants
// =============================================================================

export const ROLE_OPTIONS: UserRole[] = ["admin", "researcher", "viewer"];

export const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  admin: "border-transparent bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  researcher: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  viewer: "border-transparent bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

// =============================================================================
// Mock Users
// =============================================================================

export const INITIAL_USERS: User[] = [
  {
    id: "user-jan",
    name: "Jan de Vries",
    email: "jan@itq.nl",
    role: "admin",
    domain_ids: ["domain-sec", "domain-hc"],
  },
  {
    id: "user-sophie",
    name: "Sophie Bakker",
    email: "sophie@itq.nl",
    role: "researcher",
    domain_ids: ["domain-dw"],
  },
  {
    id: "user-mark",
    name: "Mark van den Berg",
    email: "mark@itq.nl",
    role: "researcher",
    domain_ids: ["domain-sec"],
  },
  {
    id: "user-lisa",
    name: "Lisa Jansen",
    email: "lisa@itq.nl",
    role: "viewer",
    domain_ids: ["domain-ai"],
  },
  {
    id: "user-tom",
    name: "Tom Hendriks",
    email: "tom@itq.nl",
    role: "viewer",
    domain_ids: ["domain-hc"],
  },
];

// =============================================================================
// Helpers
// =============================================================================

export function getDomainName(id: string): string {
  const domain = DOMAINS.find((d) => d.id === id);
  return domain ? domain.name : id;
}

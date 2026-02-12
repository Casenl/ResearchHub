/**
 * Research status workflow — pure state machine with no React/Firebase dependencies.
 */

import type { ResearchStatus, UserRole } from "@/types";

// -----------------------------------------------------------------------------
// Transition action definition
// -----------------------------------------------------------------------------

export interface TransitionAction {
  from: ResearchStatus;
  to: ResearchStatus;
  label: string;
  variant: "default" | "outline" | "destructive";
  /** Whether this transition requires a confirmation dialog. */
  requiresConfirm: boolean;
  /** Whether this transition is restricted to admins. */
  adminOnly: boolean;
}

// -----------------------------------------------------------------------------
// Allowed transitions map
// -----------------------------------------------------------------------------

const STATUS_TRANSITIONS: Record<ResearchStatus, ResearchStatus[]> = {
  draft: ["in_progress", "archived"],
  in_progress: ["review", "published"],
  review: ["published", "draft"],
  published: ["archived"],
  archived: [],
};

// -----------------------------------------------------------------------------
// Action definitions for each valid transition
// -----------------------------------------------------------------------------

const TRANSITION_ACTIONS: TransitionAction[] = [
  {
    from: "draft",
    to: "in_progress",
    label: "Start Working",
    variant: "default",
    requiresConfirm: false,
    adminOnly: false,
  },
  {
    from: "draft",
    to: "archived",
    label: "Archive",
    variant: "destructive",
    requiresConfirm: true,
    adminOnly: false,
  },
  {
    from: "in_progress",
    to: "review",
    label: "Submit for Review",
    variant: "outline",
    requiresConfirm: false,
    adminOnly: false,
  },
  {
    from: "in_progress",
    to: "published",
    label: "Publish",
    variant: "default",
    requiresConfirm: false,
    adminOnly: false,
  },
  {
    from: "review",
    to: "published",
    label: "Approve & Publish",
    variant: "default",
    requiresConfirm: false,
    adminOnly: true,
  },
  {
    from: "review",
    to: "draft",
    label: "Send Back",
    variant: "outline",
    requiresConfirm: false,
    adminOnly: true,
  },
  {
    from: "published",
    to: "archived",
    label: "Archive",
    variant: "destructive",
    requiresConfirm: true,
    adminOnly: false,
  },
];

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

/** Check whether a status transition is structurally valid. */
export function isValidTransition(
  from: ResearchStatus,
  to: ResearchStatus
): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Check whether a user can perform this transition given their role and authorship. */
export function canPerformTransition(
  from: ResearchStatus,
  to: ResearchStatus,
  role: UserRole,
  isAuthor: boolean
): boolean {
  if (!isValidTransition(from, to)) return false;

  const action = TRANSITION_ACTIONS.find((a) => a.from === from && a.to === to);
  if (!action) return false;

  // Admin-only transitions
  if (action.adminOnly && role !== "admin") return false;

  // Non-admin, non-author users can only view
  if (role === "viewer") return false;

  // Researchers can perform non-admin transitions on their own research
  if (role === "researcher" && !isAuthor && !action.adminOnly) return false;

  return true;
}

/** Get available workflow actions for a given status, filtered by role and authorship. */
export function getAvailableActions(
  status: ResearchStatus,
  role: UserRole,
  isAuthor: boolean
): TransitionAction[] {
  return TRANSITION_ACTIONS.filter(
    (action) =>
      action.from === status &&
      canPerformTransition(status, action.to, role, isAuthor)
  );
}

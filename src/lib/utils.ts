import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";
import { format, formatDistanceToNow, isPast, differenceInDays } from "date-fns";

import { QUALITY_TIER_LABELS } from "@/lib/constants";

import type { ResearchStatus } from "@/types";

/**
 * Merge class names using clsx and tailwind-merge.
 * Handles conditional classes, arrays, and deduplication of Tailwind utilities.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Generate a new UUID v4 identifier.
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Format an ISO date string to a human-readable format.
 * Example: "2025-06-15T10:30:00Z" -> "15 Jun 2025"
 */
export function formatDate(date: string): string {
  return format(new Date(date), "dd MMM yyyy");
}

/**
 * Get a relative time string from an ISO date.
 * Example: "3 days ago", "in 2 hours"
 */
export function getRelativeTime(date: string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

/**
 * Return a Tailwind color class string for a given research status.
 */
export function getStatusColor(status: ResearchStatus): string {
  const statusColors: Record<ResearchStatus, string> = {
    draft: "text-gray-500 bg-gray-100",
    in_progress: "text-blue-700 bg-blue-100",
    review: "text-amber-700 bg-amber-100",
    published: "text-green-700 bg-green-100",
    archived: "text-slate-500 bg-slate-100",
  };

  return statusColors[status] ?? "text-gray-500 bg-gray-100";
}

/**
 * Return a human-readable label for a quality tier (1-8).
 *
 * Tier 1 = highest quality (Government/EU reports)
 * Tier 8 = lowest quality (Vendor marketing)
 */
export function getQualityTierLabel(tier: number): string {
  if (tier < 1 || tier > 8) {
    return "Unknown tier";
  }
  return QUALITY_TIER_LABELS[tier - 1];
}

/**
 * Check whether a given ISO date string is in the past.
 */
export function isExpired(expiresAt: string): boolean {
  return isPast(new Date(expiresAt));
}

/**
 * Check whether a given ISO date string falls within the upcoming threshold.
 * Defaults to 30 days if no threshold is provided.
 * Returns false if the date is already past.
 */
export function isExpiringSoon(
  expiresAt: string,
  daysThreshold: number = 30
): boolean {
  const expirationDate = new Date(expiresAt);

  if (isPast(expirationDate)) {
    return false;
  }

  const daysUntilExpiry = differenceInDays(expirationDate, new Date());
  return daysUntilExpiry <= daysThreshold;
}

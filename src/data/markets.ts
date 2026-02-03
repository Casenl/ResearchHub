/**
 * Market seed data for the ITQ Market Intelligence Portal.
 * Hierarchical market structure used for scoping research and insights.
 */

import type { Market } from "@/types";

export const MARKETS: Market[] = [
  // Top-level
  {
    id: "market-glb",
    name: "Global",
    code: "GLB",
    parent_id: null,
  },

  // Europe (under Global)
  {
    id: "market-eu",
    name: "EU",
    code: "EU",
    parent_id: "market-glb",
  },

  // DACH region (under EU)
  {
    id: "market-dach",
    name: "DACH",
    code: "DACH",
    parent_id: "market-eu",
  },

  // Benelux region (under EU)
  {
    id: "market-bnl",
    name: "Benelux",
    code: "BNL",
    parent_id: "market-eu",
  },

  // Individual countries under Benelux
  {
    id: "market-nl",
    name: "Netherlands",
    code: "NL",
    parent_id: "market-bnl",
  },
  {
    id: "market-be",
    name: "Belgium",
    code: "BE",
    parent_id: "market-bnl",
  },

  // Individual countries under DACH
  {
    id: "market-de",
    name: "Germany",
    code: "DE",
    parent_id: "market-dach",
  },
  {
    id: "market-at",
    name: "Austria",
    code: "AT",
    parent_id: "market-dach",
  },
  {
    id: "market-ch",
    name: "Switzerland",
    code: "CH",
    parent_id: "market-dach",
  },

  // France (under EU)
  {
    id: "market-fr",
    name: "France",
    code: "FR",
    parent_id: "market-eu",
  },

  // United Kingdom (under Global)
  {
    id: "market-uk",
    name: "United Kingdom",
    code: "UK",
    parent_id: "market-glb",
  },
];

/**
 * Retrieve a market by its ID.
 */
export function getMarketById(id: string): Market | undefined {
  return MARKETS.find((market) => market.id === id);
}

/**
 * Retrieve a market by its code.
 */
export function getMarketByCode(code: string): Market | undefined {
  return MARKETS.find((market) => market.code === code);
}

/**
 * Get all child markets for a given parent ID.
 */
export function getChildMarkets(parentId: string): Market[] {
  return MARKETS.filter((market) => market.parent_id === parentId);
}

/**
 * Get the full ancestry chain for a market (from root to the market itself).
 */
export function getMarketAncestry(marketId: string): Market[] {
  const ancestry: Market[] = [];
  let current = getMarketById(marketId);

  while (current) {
    ancestry.unshift(current);
    current = current.parent_id
      ? getMarketById(current.parent_id)
      : undefined;
  }

  return ancestry;
}

/**
 * Get all top-level (root) markets.
 */
export function getRootMarkets(): Market[] {
  return MARKETS.filter((market) => market.parent_id === null);
}

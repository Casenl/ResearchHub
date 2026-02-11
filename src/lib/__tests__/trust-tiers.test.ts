import { describe, it, expect } from 'vitest';
import {
  getDefaultTierForTool,
  getClassificationForTier,
  calculateTierAdjustment,
  getTierDefinition,
} from '@/lib/trust-tiers';

// -----------------------------------------------------------------------------
// getDefaultTierForTool
// -----------------------------------------------------------------------------

describe('getDefaultTierForTool', () => {
  it('returns tier 4 for manual', () => {
    expect(getDefaultTierForTool('manual')).toBe(4);
  });

  it('returns tier 6 for notebooklm', () => {
    expect(getDefaultTierForTool('notebooklm')).toBe(6);
  });

  it('returns tier 6 for perplexity', () => {
    expect(getDefaultTierForTool('perplexity')).toBe(6);
  });

  it('returns tier 6 for claude', () => {
    expect(getDefaultTierForTool('claude')).toBe(6);
  });
});

// -----------------------------------------------------------------------------
// getClassificationForTier
// -----------------------------------------------------------------------------

describe('getClassificationForTier', () => {
  it('returns authoritative for tier 1', () => {
    expect(getClassificationForTier(1)).toBe('authoritative');
  });

  it('returns authoritative for tier 2', () => {
    expect(getClassificationForTier(2)).toBe('authoritative');
  });

  it('returns established for tier 3', () => {
    expect(getClassificationForTier(3)).toBe('established');
  });

  it('returns established for tier 4', () => {
    expect(getClassificationForTier(4)).toBe('established');
  });

  it('returns standard for tier 5', () => {
    expect(getClassificationForTier(5)).toBe('standard');
  });

  it('returns standard for tier 6', () => {
    expect(getClassificationForTier(6)).toBe('standard');
  });

  it('returns unverified for tier 7', () => {
    expect(getClassificationForTier(7)).toBe('unverified');
  });

  it('returns unverified for tier 8', () => {
    expect(getClassificationForTier(8)).toBe('unverified');
  });
});

// -----------------------------------------------------------------------------
// calculateTierAdjustment
// -----------------------------------------------------------------------------

describe('calculateTierAdjustment', () => {
  it('corroborated from tier 6 moves to tier 5', () => {
    expect(calculateTierAdjustment(6, 'corroborated')).toBe(5);
  });

  it('corroborated from tier 1 stays at floor (1)', () => {
    expect(calculateTierAdjustment(1, 'corroborated')).toBe(1);
  });

  it('human_verified from tier 6 moves to tier 4', () => {
    expect(calculateTierAdjustment(6, 'human_verified')).toBe(4);
  });

  it('human_verified from tier 2 floors at 1', () => {
    expect(calculateTierAdjustment(2, 'human_verified')).toBe(1);
  });

  it('human_verified from tier 1 stays at floor (1)', () => {
    expect(calculateTierAdjustment(1, 'human_verified')).toBe(1);
  });

  it('disputed from tier 3 moves to tier 5', () => {
    expect(calculateTierAdjustment(3, 'disputed')).toBe(5);
  });

  it('disputed from tier 7 caps at ceiling (8)', () => {
    expect(calculateTierAdjustment(7, 'disputed')).toBe(8);
  });

  it('disputed from tier 8 stays at ceiling (8)', () => {
    expect(calculateTierAdjustment(8, 'disputed')).toBe(8);
  });

  it('unverified from tier 5 stays unchanged', () => {
    expect(calculateTierAdjustment(5, 'unverified')).toBe(5);
  });
});

// -----------------------------------------------------------------------------
// getTierDefinition
// -----------------------------------------------------------------------------

describe('getTierDefinition', () => {
  it('tier 1 has classification authoritative', () => {
    const def = getTierDefinition(1);
    expect(def.classification).toBe('authoritative');
    expect(def.tier).toBe(1);
  });

  it('tier 8 has classification unverified', () => {
    const def = getTierDefinition(8);
    expect(def.classification).toBe('unverified');
    expect(def.tier).toBe(8);
  });
});

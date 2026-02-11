import { describe, it, expect } from 'vitest';
import {
  cn,
  formatDate,
  getQualityTierLabel,
  getStatusColor,
  isExpired,
  isExpiringSoon,
} from '@/lib/utils';

// -----------------------------------------------------------------------------
// cn (class name merge)
// -----------------------------------------------------------------------------

describe('cn', () => {
  it('merges multiple class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    expect(cn('base', isActive && 'active', isDisabled && 'disabled')).toBe(
      'base active',
    );
  });

  it('deduplicates conflicting Tailwind utilities', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
  });
});

// -----------------------------------------------------------------------------
// formatDate
// -----------------------------------------------------------------------------

describe('formatDate', () => {
  it('formats ISO date to "dd MMM yyyy"', () => {
    expect(formatDate('2025-06-15T10:30:00Z')).toBe('15 Jun 2025');
  });
});

// -----------------------------------------------------------------------------
// getQualityTierLabel
// -----------------------------------------------------------------------------

describe('getQualityTierLabel', () => {
  it('returns a label for tier 1', () => {
    const label = getQualityTierLabel(1);
    expect(label).toContain('Tier 1');
  });

  it('returns "Unknown tier" for tier 0', () => {
    expect(getQualityTierLabel(0)).toBe('Unknown tier');
  });

  it('returns "Unknown tier" for tier 9', () => {
    expect(getQualityTierLabel(9)).toBe('Unknown tier');
  });
});

// -----------------------------------------------------------------------------
// getStatusColor
// -----------------------------------------------------------------------------

describe('getStatusColor', () => {
  const statuses = [
    'draft',
    'in_progress',
    'review',
    'published',
    'archived',
  ] as const;

  for (const status of statuses) {
    it(`returns a string containing "bg-" for status "${status}"`, () => {
      expect(getStatusColor(status)).toContain('bg-');
    });
  }
});

// -----------------------------------------------------------------------------
// isExpired
// -----------------------------------------------------------------------------

describe('isExpired', () => {
  it('returns true for a past date', () => {
    expect(isExpired('2020-01-01T00:00:00Z')).toBe(true);
  });

  it('returns false for a future date', () => {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    expect(isExpired(futureDate.toISOString())).toBe(false);
  });
});

// -----------------------------------------------------------------------------
// isExpiringSoon
// -----------------------------------------------------------------------------

describe('isExpiringSoon', () => {
  it('returns true for a date 10 days from now (default 30-day threshold)', () => {
    const soon = new Date();
    soon.setDate(soon.getDate() + 10);
    expect(isExpiringSoon(soon.toISOString())).toBe(true);
  });

  it('returns false for a date 60 days from now (default 30-day threshold)', () => {
    const far = new Date();
    far.setDate(far.getDate() + 60);
    expect(isExpiringSoon(far.toISOString())).toBe(false);
  });
});

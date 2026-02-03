/**
 * Shared formatting helpers for the Usage & Cost Tracking page.
 */

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("nl-NL").format(n);
}

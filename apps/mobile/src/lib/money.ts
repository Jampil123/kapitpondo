/**
 * lib/money.ts
 * ----------------------------------------------------------------------------
 * Money helpers. The API stores money as numeric(14,2), which PostgREST returns
 * as a STRING (e.g. "1500.00") to preserve precision — never as a float. Keep
 * it that way: format for display, but don't do arithmetic on the float.
 */

export type Money = string | number;

/** Format a numeric(14,2) value as Philippine pesos: ₱1,500.00 */
export function formatPeso(value: Money | null | undefined): string {
  if (value === null || value === undefined || value === '') return '₱0.00';
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return '₱0.00';
  return `₱${n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Plain grouped number without the sign: 1,500.00 */
export function formatAmount(value: Money | null | undefined): string {
  return formatPeso(value).replace('₱', '');
}

/**
 * Normalize user input ("1,500" / "1500" / "₱1,500.50") to a clean decimal
 * string suitable for sending to the API. Returns null if it isn't a number.
 */
export function toAmountString(input: string): string | null {
  const cleaned = input.replace(/[₱,\s]/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(cleaned)) return null;
  return Number(cleaned).toFixed(2);
}

/** True if the value is a positive amount. */
export function isPositiveAmount(input: string): boolean {
  const s = toAmountString(input);
  return s !== null && Number(s) > 0;
}
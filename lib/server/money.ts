import "server-only";

import { DEFAULT_CURRENCY, formatMoney } from "@/lib/currency";

/**
 * The two money representations in this app, and the only place they meet.
 *
 * `products.price` is Postgres `numeric`, which Drizzle hands back as a string
 * ("48.00") so a price never round-trips through a float. Stripe works in minor
 * units — `unit_amount` and `amount_total` are integer cents. Orders store
 * cents to match Stripe (see db/schemas/order.ts), so exactly one conversion
 * happens per price, here, at the boundary.
 */

/**
 * A `numeric` price string to integer cents.
 *
 * `Math.round` rather than a truncation: parsing "48.10" yields 48.099999…, and
 * truncating that undercharges by a cent. Rounding at two decimal places is
 * safe for any value the column can hold — `numeric(10,2)` tops out well inside
 * the range where a double still represents cents exactly.
 */
export function toCents(price: string): number {
  const amount = Number(price);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`Not a usable price: ${price}`);
  }

  return Math.round(amount * 100);
}

/**
 * Integer cents to a display string, e.g. 4800 → "48,00 RON", or "$48.00" for
 * a USD row. The locale follows the currency, never the viewer — see
 * `formatMoney` in lib/currency.ts, which this shares with client code.
 */
export function formatCents(cents: number, currency = DEFAULT_CURRENCY): string {
  return formatMoney(cents / 100, currency);
}

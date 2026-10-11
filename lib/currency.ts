/**
 * Money display, shared by server and client code.
 *
 * Every price and order row carries its own `currency`, and that is what gets
 * displayed and charged. `DEFAULT_CURRENCY` only decides what a *new* product
 * is priced in (lib/server/dal/products.ts) and what a figure with no currency
 * of its own falls back to. Rows created before the switch to lei stay in USD:
 * a price only means something in the currency it was set in, and an order
 * records what Stripe actually charged.
 */
export const DEFAULT_CURRENCY = "RON";

/**
 * The locale each currency is written in, so lei read the way a Romanian buyer
 * expects ("19,00 RON") and dollars stay "$19.00". Keyed by currency rather
 * than by viewer: the currency is a property of the sale, and a seller's
 * revenue shouldn't reformat depending on who is looking at it.
 */
const LOCALE_BY_CURRENCY: Record<string, string> = {
  RON: "ro-RO",
  USD: "en-US",
};

/**
 * A major-unit amount (19.5, not cents) as money, e.g. 19.5 → "19,50 RON".
 *
 * `wholeWithoutDecimals` drops ",00" from whole amounts ("19 RON") — used for
 * list prices, where most are whole and the decimals are noise. Totals and
 * order amounts keep both decimals.
 */
export function formatMoney(
  amount: number,
  currency: string = DEFAULT_CURRENCY,
  { wholeWithoutDecimals = false }: { wholeWithoutDecimals?: boolean } = {},
): string {
  const code = currency.toUpperCase();
  const trim = wholeWithoutDecimals && Number.isInteger(amount);

  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[code] ?? "en-US", {
    style: "currency",
    currency: code,
    ...(trim ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}),
  }).format(amount);
}

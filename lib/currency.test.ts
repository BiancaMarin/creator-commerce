import { describe, expect, it } from "vitest";

import { DEFAULT_CURRENCY, formatMoney } from "@/lib/currency";

// Intl separates the amount and "RON" with a no-break space (U+00A0).
const nbsp = " ";

describe("formatMoney", () => {
  it("defaults to lei, written the Romanian way", () => {
    expect(DEFAULT_CURRENCY).toBe("RON");
    expect(formatMoney(19)).toBe(`19,00${nbsp}RON`);
    expect(formatMoney(1234.5)).toBe(`1.234,50${nbsp}RON`);
  });

  it("keeps dollars in en-US", () => {
    expect(formatMoney(48, "USD")).toBe("$48.00");
    expect(formatMoney(48, "usd")).toBe("$48.00");
  });

  it("drops the decimals of whole list prices only when asked", () => {
    expect(formatMoney(19, "RON", { wholeWithoutDecimals: true })).toBe(`19${nbsp}RON`);
    expect(formatMoney(19.5, "RON", { wholeWithoutDecimals: true })).toBe(`19,50${nbsp}RON`);
    expect(formatMoney(48, "USD", { wholeWithoutDecimals: true })).toBe("$48");
  });
});

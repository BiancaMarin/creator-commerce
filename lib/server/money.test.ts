import { describe, expect, it } from "vitest";

import { formatCents, toCents } from "@/lib/server/money";

describe("toCents", () => {
  it("rounds rather than truncating float error", () => {
    // 48.10 * 100 is 4809.999… as a double.
    expect(toCents("48.10")).toBe(4810);
  });

  it("handles whole and zero prices", () => {
    expect(toCents("48.00")).toBe(4800);
    expect(toCents("0")).toBe(0);
  });

  it.each(["-1", "abc", "Infinity"])("rejects %s", (price) => {
    expect(() => toCents(price)).toThrow();
  });
});

describe("formatCents", () => {
  it("formats as en-US currency", () => {
    expect(formatCents(4800)).toBe("$48.00");
    expect(formatCents(123456)).toBe("$1,234.56");
  });
});

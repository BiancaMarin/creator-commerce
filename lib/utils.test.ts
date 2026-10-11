import { describe, expect, it } from "vitest";

import {
  DEFAULT_SIGNED_IN_PATH,
  formatFileSize,
  getInitials,
  safeNextPath,
  signInToCheckoutHref,
  slugify,
} from "@/lib/utils";

describe("safeNextPath", () => {
  it("keeps a same-origin path", () => {
    expect(safeNextPath("/orders?tab=paid")).toBe("/orders?tab=paid");
  });

  it.each([
    ["missing", null],
    ["empty", ""],
    ["absolute URL", "https://evil.example"],
    ["protocol-relative", "//evil.example"],
    ["backslash protocol-relative", "/\\evil.example"],
  ])("falls back on a %s target", (_, raw) => {
    expect(safeNextPath(raw)).toBe(DEFAULT_SIGNED_IN_PATH);
  });
});

describe("signInToCheckoutHref", () => {
  it("adds the checkout flag and round-trips through safeNextPath", () => {
    const href = signInToCheckoutHref("/cart");
    const next = new URL(href, "http://x").searchParams.get("next");

    expect(next).toBe("/cart?checkout=1");
    expect(safeNextPath(next)).toBe("/cart?checkout=1");
  });

  it("appends to an existing query string", () => {
    const next = new URL(signInToCheckoutHref("/a/1/b?x=1"), "http://x")
      .searchParams.get("next");

    expect(next).toBe("/a/1/b?x=1&checkout=1");
  });
});

describe("slugify", () => {
  it("strips accents instead of dropping the letters", () => {
    expect(slugify("Café Décor")).toBe("cafe-decor");
  });

  it("collapses separators and trims hyphens", () => {
    expect(slugify("  --Hello,  World!!--  ")).toBe("hello-world");
  });

  it("never ends in a hyphen after truncating", () => {
    expect(slugify("abcd efgh", 5)).toBe("abcd");
  });
});

describe("formatFileSize", () => {
  it.each([
    [84, "84 B"],
    [1024, "1 KB"],
    [1_500_000, "1.4 MB"],
    [100 * 1024 * 1024, "100 MB"],
  ])("%i bytes -> %s", (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });
});

describe("getInitials", () => {
  it("takes the first two words", () => {
    expect(getInitials("alex de la rivera")).toBe("AD");
  });
});

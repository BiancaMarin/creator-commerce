import { describe, expect, it } from "vitest";

import { strings } from "@/constants/strings";
import { ro } from "@/constants/strings.ro";
import { getDictionary, messageKey, translateMessage } from "@/lib/i18n";
import { MAX_PRODUCT_IMAGES, productSchema } from "@/lib/schemas/product";

describe("translateMessage", () => {
  it("resolves a key in the reader's dictionary", () => {
    const key = messageKey("validation.invalidEmail");

    expect(translateMessage(strings, key)).toBe(strings.validation.invalidEmail);
    expect(translateMessage(ro, key)).toBe(ro.validation.invalidEmail);
  });

  it("fills parameters carried on the key", () => {
    const key = messageKey("validation.productImageCount", { count: 6 });

    expect(translateMessage(ro, key)).toBe("Poți adăuga cel mult 6 imagini.");
  });

  it("passes through text that isn't a key", () => {
    expect(translateMessage(ro, "Already translated.")).toBe(
      "Already translated.",
    );
    expect(translateMessage(ro, "validation.noSuchKey")).toBe(
      "validation.noSuchKey",
    );
  });

  it("resolves what the shared zod schemas emit", () => {
    const result = productSchema.safeParse({
      name: "Pack",
      tag: "Presets",
      description: "A long enough description.",
      price: "10",
      file: { key: "k", name: "f.zip", size: 1 },
      imageUrls: Array(MAX_PRODUCT_IMAGES + 1).fill("https://example.com/a.png"),
    });

    expect(translateMessage(getDictionary("en"), result.error!.issues[0].message)).toBe(
      `You can add up to ${MAX_PRODUCT_IMAGES} images.`,
    );
  });
});

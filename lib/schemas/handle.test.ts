import { describe, expect, it } from "vitest";

import { strings } from "@/constants/strings";
import { HANDLE_MAX_LENGTH, handleSchema } from "@/lib/schemas/handle";

describe("handleSchema", () => {
  it("normalises case and whitespace before validating", () => {
    expect(handleSchema.parse({ handle: "  My-Store " })).toEqual({
      handle: "my-store",
    });
  });

  it.each(["-store", "store-", "my--store", "my_store"])(
    "rejects the badly formed %s",
    (handle) => {
      const result = handleSchema.safeParse({ handle });

      expect(result.success).toBe(false);
      expect(result.error?.issues[0].message).toBe(
        strings.validation.handleFormat,
      );
    },
  );

  it.each(["ab", "a".repeat(HANDLE_MAX_LENGTH + 1)])(
    "rejects the wrong length: %s",
    (handle) => {
      const result = handleSchema.safeParse({ handle });

      expect(result.error?.issues[0].message).toBe(
        strings.validation.handleLength,
      );
    },
  );
});

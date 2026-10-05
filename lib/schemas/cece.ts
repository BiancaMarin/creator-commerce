import { z } from "zod";

/**
 * Inputs for CECE, the in-app assistant (lib/server/cece/).
 *
 * The tool input schemas live here rather than beside the tools because they
 * are the tools' public contract: the chat route validates against them today,
 * and an MCP server exposing the same tools will advertise them as its
 * `inputSchema`s. The `.describe()` text is read by the model, not by people —
 * it is what makes the model fill a field correctly.
 */

/** The help topics `get_help` can answer. Content: lib/server/cece/guide.ts. */
export const CECE_HELP_TOPICS = [
  "getting_started",
  "create_product",
  "edit_or_delete_product",
  "product_files_and_images",
  "ai_drafts",
  "pricing_and_fees",
  "storefront_and_handle",
  "orders_and_customers",
  "buying_and_downloads",
  "explore_marketplace",
] as const;

export type CeceHelpTopic = (typeof CECE_HELP_TOPICS)[number];

export const getHelpInput = z.object({
  topic: z
    .enum(CECE_HELP_TOPICS)
    .describe("The part of the platform the user needs help with."),
});

export const emptyInput = z.object({});

export const listMyProductsInput = z.object({
  query: z
    .string()
    .trim()
    .max(100)
    .optional()
    .describe(
      "Part of a product name to match. Omit to list the most recent products.",
    ),
});

export const getMyProductInput = z.object({
  productId: z
    .number()
    .int()
    .positive()
    .describe("The product id, as returned by list_my_products."),
});

export const listRecentOrdersInput = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .describe("How many order lines to return, newest first. Defaults to 10."),
});

export const listTopCustomersInput = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(10)
    .optional()
    .describe("How many customers to return, biggest spender first. Defaults to 5."),
});

export const searchMarketplaceInput = z.object({
  query: z
    .string()
    .trim()
    .max(100)
    .optional()
    .describe(
      "Words to find in product names and descriptions. Needs at least 3 characters to filter; shorter or omitted browses the newest products.",
    ),
  type: z
    .string()
    .trim()
    .max(60)
    .optional()
    .describe('A product type to narrow to, e.g. "Lightroom presets".'),
  maxPrice: z
    .number()
    .nonnegative()
    // `numeric(10,2)`'s ceiling. Also keeps `toFixed` out of exponent notation.
    .max(99_999_999)
    .optional()
    .describe("Highest price in USD, inclusive."),
});

/** Most messages the route will pass to the model: older ones are dropped. */
export const CECE_MAX_HISTORY = 20;

/** The longest question a user can type. Mirrored by the input's maxLength. */
export const CECE_MAX_INPUT_LENGTH = 2000;

/**
 * The chat request body. `messages` is left structurally loose here and checked
 * by the AI SDK's `validateUIMessages` in the route, which knows the tool part
 * shapes; this only bounds what arrives before that runs.
 */
export const ceceRequestSchema = z.object({
  // The client trims to CECE_MAX_HISTORY before sending (cece-provider.tsx),
  // so anything longer is not our client.
  messages: z.array(z.unknown()).min(1).max(CECE_MAX_HISTORY),
  // The page the user had open, so "how do I do this here?" has a referent.
  // Only a path, and only used as a hint in the prompt.
  pathname: z
    .string()
    .max(200)
    .regex(/^\/[\w\-/.]*$/)
    .catch("/"),
});

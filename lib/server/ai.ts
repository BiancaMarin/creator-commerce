import "server-only";

import { generateText } from "ai";

import type { ProductDescriptionRequest } from "@/lib/schemas/product";

/**
 * The model product descriptions are written with, routed through the Vercel
 * AI Gateway — a plain "provider/model" string is a Gateway model in the AI
 * SDK, so there is no provider package.
 *
 * A Gateway **free-tier** model on purpose: free credits refuse the larger ones
 * (Claude included) with "Free tier users do not have access to this model".
 * It also has to accept images, since a description can start from the cover.
 * `AI_DESCRIPTION_MODEL` overrides it without a code change once the account
 * has paid credits.
 *
 * Auth is the SDK's own: `AI_GATEWAY_API_KEY` locally, the OIDC token Vercel
 * injects on a deployment.
 */
const DESCRIPTION_MODEL =
  process.env.AI_DESCRIPTION_MODEL ?? "google/gemini-2.5-flash";

/** Mirrors `productSchema.description.max` — a longer draft couldn't be saved. */
const DESCRIPTION_MAX_LENGTH = 2000;

/** A slow model call shouldn't hold the button in "Writing…" indefinitely. */
const TIMEOUT_MS = 30_000;

const INSTRUCTIONS = `You write product descriptions for a marketplace where creators sell digital products (presets, templates, courses, e-books, audio packs and the like).

Write one description for the product you are given:
- 60 to 120 words, in 2 short paragraphs.
- Say what the buyer gets, who it is for, and what they can do with it.
- Plain text only: no markdown, no headings, no bullet points, no emoji, no quotes around the text.
- Do not invent specifics you were not given (file counts, formats, durations, prices, compatibility). Stay general where you don't know.
- If an image is provided, use what it shows — style, subject, mood — but don't describe it as "the image".
- Write in the same language as the product name. If there is no name, write in English.
- Reply with the description and nothing else.`;

/**
 * Drafts a product description from whatever the creator has so far: the
 * name, the type, the cover image, or any mix of them.
 *
 * Returns the text, or null when the model call fails or comes back empty.
 * Throwing is left for real bugs: a Gateway outage, an exhausted credit
 * balance, a timeout are all expected and the form just keeps what it had.
 *
 * `request.imageUrl` must already be checked with `isOwnStorageUrl`. The
 * Gateway fetches it, so an unchecked URL is a fetch of any address.
 */
export async function generateProductDescription(
  request: ProductDescriptionRequest,
): Promise<string | null> {
  const details = [
    request.name && `Product name: ${request.name}`,
    request.tag && `Product type: ${request.tag}`,
    !request.name && "No name yet: describe it from the image.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const { text } = await generateText({
      model: DESCRIPTION_MODEL,
      instructions: INSTRUCTIONS,
      timeout: TIMEOUT_MS,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: details },
            ...(request.imageUrl
              ? [
                  {
                    type: "file" as const,
                    mediaType: "image",
                    data: request.imageUrl,
                  },
                ]
              : []),
          ],
        },
      ],
    });

    const description = text.trim().slice(0, DESCRIPTION_MAX_LENGTH);

    return description.length > 0 ? description : null;
  } catch (error) {
    console.error("[ai] product description failed", error);

    return null;
  }
}

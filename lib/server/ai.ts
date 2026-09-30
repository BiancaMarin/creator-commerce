import "server-only";

import { generateText, Output, type UserContent } from "ai";

import {
  productDraftSchema,
  type ProductDescriptionRequest,
  type ProductDraft,
  type ProductFile,
} from "@/lib/schemas/product";
import { storageUrl } from "@/lib/server/uploadthing";
import { formatFileSize } from "@/lib/utils";

/**
 * The model product drafts are written with, routed through the Vercel
 * AI Gateway — a plain "provider/model" string is a Gateway model in the AI
 * SDK, so there is no provider package.
 *
 * A Gateway **free-tier** model on purpose: free credits refuse the larger ones
 * (Claude included) with "Free tier users do not have access to this model".
 * It also has to read images and PDFs, since a description can start from the
 * cover or the product file. `AI_DESCRIPTION_MODEL` overrides it without a code
 * change once the account has paid credits.
 *
 * Auth is the SDK's own: `AI_GATEWAY_API_KEY` locally, the OIDC token Vercel
 * injects on a deployment.
 */
const DRAFT_MODEL =
  process.env.AI_DESCRIPTION_MODEL ?? "google/gemini-2.5-flash";

/**
 * Mirror the `.max()`s in `productSchema` — a longer value couldn't be saved.
 * The name is held well under its 255 on purpose: it's a storefront title and
 * the slug source, not a sentence.
 */
const NAME_MAX_LENGTH = 60;
const TAG_MAX_LENGTH = 60;
const DESCRIPTION_MAX_LENGTH = 2000;

/** How many existing types are offered to the model to reuse. */
const KNOWN_TYPES_LIMIT = 40;

/**
 * A slow model call shouldn't hold the button in "Writing…" indefinitely. Longer
 * than a text-only call needs, because reading a PDF takes the model a while.
 */
const TIMEOUT_MS = 45_000;

/**
 * The largest product file whose *contents* are sent to the model. Anything
 * bigger is described from its name and size alone: a 100 MB download for one
 * description is slow and costly, and the first pages of a document say what
 * it is anyway.
 */
const MAX_READ_BYTES = 10 * 1024 * 1024;

/** Text files are inlined as text; this keeps a huge CSV from flooding the prompt. */
const MAX_TEXT_CHARS = 30_000;

/**
 * Product file types a model can actually read, by extension. The upload route
 * takes any file (`blob`) and the form value carries no MIME type, so the
 * extension is what's available. Everything else — zips, videos, presets,
 * fonts — is described from its name and size.
 */
const READABLE_TYPES: Record<string, { kind: "file" | "text"; mediaType: string }> = {
  pdf: { kind: "file", mediaType: "application/pdf" },
  png: { kind: "file", mediaType: "image/png" },
  jpg: { kind: "file", mediaType: "image/jpeg" },
  jpeg: { kind: "file", mediaType: "image/jpeg" },
  webp: { kind: "file", mediaType: "image/webp" },
  txt: { kind: "text", mediaType: "text/plain" },
  md: { kind: "text", mediaType: "text/markdown" },
  csv: { kind: "text", mediaType: "text/csv" },
  json: { kind: "text", mediaType: "application/json" },
};

/** A user message's parts. `UserContent` also allows a bare string, which can't be spread. */
type ContentParts = Exclude<UserContent, string>;

const INSTRUCTIONS = `You write product listings for a marketplace where creators sell digital products (presets, templates, courses, e-books, audio packs and the like).

Return three fields: a name, a type and a description.

Name: a clear, specific storefront title of 3 to 60 characters. No quotes, no emoji, no words like "Ultimate" or "Best" unless the material says so. If a product name was given, return it exactly as given.

Type: what kind of product it is, in 1 to 3 words (for example "Lightroom presets", "Video course", "Notion template", "E-book"). If a product type was given, return it exactly as given. Otherwise, if one of the existing marketplace types fits, return it with the same spelling, so similar products are grouped together.

Description:
- 60 to 120 words, in 2 short paragraphs.
- Say what the buyer gets, who it is for, and what they can do with it.
- Plain text only: no markdown, no headings, no bullet points, no emoji, no quotes around the text.
- You may be given the product file itself (for example a PDF). When you are, base the description on what it actually contains: its topics, structure and style. Don't quote long passages from it.
- When you only get the file's name and size, use them as hints but don't guess at contents.
- Do not invent specifics you were not given (file counts, formats, durations, prices, compatibility). Stay general where you don't know.
- If a cover image is provided, use what it shows (style, subject, mood), but don't describe it as "the image".
- Write in the same language as the product name. If there is no name, use the language of the product file, or English.

Write the name and type in the same language as the description.`;

/** What the model is told about the product file, and its contents when readable. */
async function productFileContent(file: ProductFile): Promise<ContentParts> {
  const label = `Product file: ${file.name} (${formatFileSize(file.size)})`;
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  const readable = READABLE_TYPES[extension];

  if (!readable || file.size > MAX_READ_BYTES) {
    return [{ type: "text", text: `${label}. Contents not provided.` }];
  }

  try {
    // Fetched here and passed as bytes, never as a URL: `storageUrl` is the
    // permanent public address of a paid product and must not leave this
    // server — not to the browser, and not into a model provider's logs.
    const response = await fetch(storageUrl(file.key), {
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      throw new Error(`storage responded ${response.status}`);
    }

    const bytes = new Uint8Array(await response.arrayBuffer());

    if (readable.kind === "text") {
      const text = new TextDecoder().decode(bytes).slice(0, MAX_TEXT_CHARS);

      return [
        { type: "text", text: `${label}. Its contents:\n\n${text}` },
      ];
    }

    return [
      { type: "text", text: `${label}. The file is attached.` },
      { type: "file", mediaType: readable.mediaType, data: bytes },
    ];
  } catch (error) {
    // An unreadable file shouldn't cost the creator their description: fall
    // back to the name, which is what non-document files get anyway.
    console.error("[ai] couldn't read product file", error);

    return [{ type: "text", text: `${label}. Contents not provided.` }];
  }
}

/** Collapses whitespace and cuts to a column's width, for the one-line fields. */
function clampLine(value: string, maxLength: number) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength).trim();
}

/**
 * Drafts a product's name, type and description from whatever the creator has
 * so far: the name, the type, the cover image, the product file, or any mix of
 * them. `knownTypes` are the marketplace's existing type labels, offered so a
 * new product lands in an existing /explore filter instead of a near-duplicate
 * one ("Presets" beside "presets").
 *
 * Returns the draft, or null when the model call fails or the description
 * comes back empty. A name or type that comes back empty is returned empty;
 * the form only fills fields the creator left blank, so an empty one is simply
 * not used.
 * Throwing is left for real bugs: a Gateway outage, an exhausted credit
 * balance, a timeout are all expected and the form just keeps what it had.
 *
 * The caller must have checked `request.imageUrl` with `isOwnStorageUrl`
 * (the Gateway fetches it) and `request.file.key` with
 * `isFileKeyOfOtherSeller` (this function reads it).
 */
export async function generateProductDraft(
  request: ProductDescriptionRequest,
  knownTypes: string[],
): Promise<ProductDraft | null> {
  const details = [
    request.name
      ? `Product name: ${request.name}`
      : "No product name yet: write one from what you're given.",
    request.tag
      ? `Product type: ${request.tag}`
      : "No product type yet: choose one.",
    knownTypes.length > 0 &&
      `Existing marketplace types: ${knownTypes.slice(0, KNOWN_TYPES_LIMIT).join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");

  const content: ContentParts = [
    { type: "text", text: details },
    ...(request.imageUrl
      ? [
          { type: "text" as const, text: "Cover image:" },
          {
            type: "file" as const,
            mediaType: "image",
            data: request.imageUrl,
          },
        ]
      : []),
    ...(request.file ? await productFileContent(request.file) : []),
  ];

  try {
    const { output } = await generateText({
      model: DRAFT_MODEL,
      instructions: INSTRUCTIONS,
      timeout: TIMEOUT_MS,
      output: Output.object({ schema: productDraftSchema }),
      messages: [{ role: "user", content }],
    });

    const description = output.description
      .trim()
      .slice(0, DESCRIPTION_MAX_LENGTH);

    if (description.length === 0) {
      return null;
    }

    return {
      name: clampLine(output.name, NAME_MAX_LENGTH),
      tag: clampLine(output.tag, TAG_MAX_LENGTH),
      description,
    };
  } catch (error) {
    console.error("[ai] product draft failed", error);

    return null;
  }
}

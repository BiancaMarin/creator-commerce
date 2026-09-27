/**
 * Reaps orphaned UploadThing files — uploads nothing in the database points at.
 *
 * They exist because uploads are deliberately decoupled from rows: the routes in
 * `app/api/uploadthing/core.ts` write nothing on completion, and the fields in
 * `components/dashboard/product-{image,file}-field.tsx` only edit a form value.
 * That is what keeps an abandoned "new product" form from mutating the catalog —
 * the cost is that every abandoned form, every image removed before saving, and
 * every file replaced by a second upload leaves bytes behind that no code path
 * will ever read again. This script is the other half of that trade.
 *
 * Run it by hand, or on a schedule; it is not wired into the app.
 *
 *   npm run cleanup:orphans              # dry run — lists, deletes nothing
 *   npm run cleanup:orphans -- --delete  # actually deletes
 *
 * Flags:
 *   --delete            Perform the deletion. Without it this only reports.
 *   --grace-hours=N     Ignore files younger than N hours (default 24).
 *   --force             Skip the empty-catalog guard. See `productCount` below.
 *
 * Deliberately raw SQL over `@neondatabase/serverless` rather than the app's
 * Drizzle layer: `lib/server/db/index.ts` imports `server-only`, which throws
 * outside a Next build, and the schema modules reach for the `@/` alias that
 * plain `node` cannot resolve. Two SELECTs do not justify a second module graph.
 */

import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { UTApi } from "uploadthing/server";

/**
 * How recent an upload has to be to get a pass, in hours.
 *
 * Not a nicety — it is the only thing separating this script from a data-loss
 * bug. A creator with a half-filled product form is holding uploads that are
 * genuinely unreferenced and will become referenced the moment they hit Save. A
 * window wide enough to cover "filled the form, went to lunch, came back" is the
 * difference between reaping garbage and deleting someone's work in progress.
 */
const DEFAULT_GRACE_HOURS = 24;

/** Keys per `deleteFiles` call. The API takes an array; this keeps requests sane. */
const DELETE_BATCH_SIZE = 100;

/** `listFiles` is paginated; this is the page size, not a ceiling on what is scanned. */
const LIST_PAGE_SIZE = 500;

type Args = {
  del: boolean;
  graceHours: number;
  force: boolean;
};

function parseArgs(argv: string[]): Args {
  const graceArg = argv.find((arg) => arg.startsWith("--grace-hours="));
  const graceHours = graceArg
    ? Number(graceArg.split("=")[1])
    : DEFAULT_GRACE_HOURS;

  if (!Number.isFinite(graceHours) || graceHours < 0) {
    throw new Error(
      `--grace-hours must be a non-negative number, got "${graceArg}"`,
    );
  }

  return {
    del: argv.includes("--delete"),
    graceHours,
    force: argv.includes("--force"),
  };
}

/**
 * The storage key inside an image URL.
 *
 * `products.image_urls` holds full `https://<appId>.ufs.sh/f/<key>` addresses
 * (see that column's comment) while `products.file_key` holds a bare key, so the
 * two have to be normalised to the same thing before they can be compared.
 * Returns null rather than throwing on anything that is not such a URL: a row
 * carrying something unexpected should be ignored, and ignoring it here means
 * whatever it points at is treated as still referenced.
 */
function keyFromImageUrl(url: string): string | null {
  try {
    const { pathname } = new URL(url);
    const marker = "/f/";

    if (!pathname.startsWith(marker)) {
      return null;
    }

    return decodeURIComponent(pathname.slice(marker.length));
  } catch {
    return null;
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;

  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }

  return `${value.toFixed(1)} ${units[unit]}`;
}

/**
 * Every storage key the database still refers to.
 *
 * Two rules here are load-bearing:
 *
 *  - **Soft-deleted products count.** `products.deleted_at` is a soft delete —
 *    the row survives, /downloads still serves the file to anyone who bought it,
 *    and the product can come back. Filtering on `deleted_at is null` here would
 *    delete files paying customers are still entitled to. The missing WHERE
 *    clause in that query is the point.
 *  - **`user.image` counts.** It is written by the auth provider today, not by
 *    an upload route, but it is a text column that can hold a ufs.sh URL, and
 *    "no upload route writes there *yet*" is not something to bet a deletion on.
 */
async function referencedKeys(sql: NeonQueryFunction<false, false>) {
  const products = (await sql`
    select file_key, image_urls from products
  `) as { file_key: string | null; image_urls: string[] | null }[];

  const users = (await sql`
    select image from "user" where image is not null
  `) as { image: string | null }[];

  const keys = new Set<string>();

  for (const product of products) {
    if (product.file_key) {
      keys.add(product.file_key);
    }

    for (const url of product.image_urls ?? []) {
      const key = keyFromImageUrl(url);

      if (key) {
        keys.add(key);
      }
    }
  }

  for (const { image } of users) {
    const key = image ? keyFromImageUrl(image) : null;

    if (key) {
      keys.add(key);
    }
  }

  return { keys, productCount: products.length };
}

/** Every file UploadThing holds for this app, walked page by page. */
async function listAllFiles(utapi: UTApi) {
  const files: {
    key: string;
    name: string;
    size: number;
    uploadedAt: number;
    status: string;
  }[] = [];

  let offset = 0;

  for (;;) {
    const page = await utapi.listFiles({ limit: LIST_PAGE_SIZE, offset });

    files.push(...page.files);

    if (!page.hasMore || page.files.length === 0) {
      return files;
    }

    offset += page.files.length;
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!process.env.PG_CONNECTION_STRING) {
    throw new Error(
      "PG_CONNECTION_STRING is not set — run through `npm run cleanup:orphans`",
    );
  }

  if (!process.env.UPLOADTHING_TOKEN) {
    throw new Error(
      "UPLOADTHING_TOKEN is not set — run through `npm run cleanup:orphans`",
    );
  }

  const sql = neon(process.env.PG_CONNECTION_STRING);
  const utapi = new UTApi();

  const [{ keys, productCount }, files] = await Promise.all([
    referencedKeys(sql),
    listAllFiles(utapi),
  ]);

  // A catalog with no rows at all almost always means the wrong database — an
  // empty branch, a stale connection string — and in that state *every* file
  // looks orphaned. Refusing here turns the worst possible misconfiguration into
  // a message rather than an empty bucket.
  if (productCount === 0 && !args.force) {
    throw new Error(
      "The products table is empty — refusing to treat every upload as an orphan. " +
        "Check PG_CONNECTION_STRING, or pass --force if the catalog really is empty.",
    );
  }

  const cutoff = Date.now() - args.graceHours * 60 * 60 * 1000;
  // Anything mid-upload or already queued for deletion is not this script's to
  // judge, so "unreferenced" is only ever asked about settled files.
  const unreferenced = files.filter(
    (file) => !keys.has(file.key) && file.status === "Uploaded",
  );
  const orphans = unreferenced.filter((file) => file.uploadedAt < cutoff);
  const spared = unreferenced.length - orphans.length;

  const bytes = orphans.reduce((total, file) => total + file.size, 0);

  console.log(`Files in storage:      ${files.length}`);
  console.log(`Referenced by the DB:  ${keys.size}`);
  console.log(
    `Within grace window:   ${spared} (younger than ${args.graceHours}h, skipped)`,
  );
  console.log(`Orphans:               ${orphans.length} (${formatBytes(bytes)})`);

  if (orphans.length === 0) {
    return;
  }

  console.log("");

  for (const file of orphans) {
    const age = Math.round((Date.now() - file.uploadedAt) / (60 * 60 * 1000));

    console.log(
      `  ${file.key}  ${file.name} (${formatBytes(file.size)}, ${age}h old)`,
    );
  }

  console.log("");

  if (!args.del) {
    console.log(
      "Dry run — nothing deleted. Re-run with `-- --delete` to reap these.",
    );

    return;
  }

  let deleted = 0;

  for (let at = 0; at < orphans.length; at += DELETE_BATCH_SIZE) {
    const batch = orphans.slice(at, at + DELETE_BATCH_SIZE).map((f) => f.key);
    const result = await utapi.deleteFiles(batch);

    deleted += result.deletedCount;
  }

  console.log(`Deleted ${deleted} file(s), freeing ${formatBytes(bytes)}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

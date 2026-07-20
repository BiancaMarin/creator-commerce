import "server-only";

import { eq } from "drizzle-orm";

import db from "@/lib/server/db";
import { user } from "@/lib/server/db/schemas/auth";

/** Matches the shape enforced by the `handle` column: 3–30 chars, [a-z0-9-]. */
const MIN_LENGTH = 3;
const MAX_LENGTH = 30;

/**
 * Turn an email local part into a URL-safe slug: lowercase, non-alphanumerics
 * collapsed to hyphens, no leading/trailing or doubled hyphens.
 */
function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, MAX_LENGTH);
}

function randomSuffix() {
  return Math.random().toString(36).slice(2, 6);
}

async function isTaken(candidate: string) {
  const [row] = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.handle, candidate))
    .limit(1);

  return Boolean(row);
}

/**
 * Derives a unique storefront handle from an email address.
 *
 * Handles are no longer collected at signup, so this runs in the Better Auth
 * `user.create.before` hook. On collision it appends a short random suffix and
 * retries; after `maxAttempts` it falls back to a suffix-only handle, which is
 * ugly but guaranteed free rather than throwing mid-signup.
 */
export async function generateUniqueHandle(email: string, maxAttempts = 5) {
  const local = email.split("@")[0] ?? "";
  let base = slugify(local);

  // "a@x.com" or "___@x.com" can slugify to something too short for the column.
  if (base.length < MIN_LENGTH) {
    base = `creator-${base}`.replace(/-$/, "");
  }

  if (!(await isTaken(base))) {
    return base;
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const suffix = randomSuffix();
    // Trim the base so base + suffix still fits the column.
    const trimmed = base.slice(0, MAX_LENGTH - suffix.length - 1);
    const candidate = `${trimmed}-${suffix}`;

    if (!(await isTaken(candidate))) {
      return candidate;
    }
  }

  return `creator-${Date.now().toString(36)}${randomSuffix()}`.slice(
    0,
    MAX_LENGTH,
  );
}

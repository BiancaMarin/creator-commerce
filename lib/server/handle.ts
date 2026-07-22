import "server-only";

import { and, ne, sql } from "drizzle-orm";

import { HANDLE_MAX_LENGTH, HANDLE_MIN_LENGTH } from "@/lib/handle-schema";
import db from "@/lib/server/db";
import { user } from "@/lib/server/db/schemas/auth";
// Same slug rules as product URLs — handles and slugs are both path segments.
import { slugify } from "@/lib/slug";

const MIN_LENGTH = HANDLE_MIN_LENGTH;
const MAX_LENGTH = HANDLE_MAX_LENGTH;

function randomSuffix() {
  return Math.random().toString(36).slice(2, 6);
}

/**
 * Is this handle already claimed? Compared case-insensitively to match
 * `getCreatorByHandle`, which resolves /Test and /test to the same store — so
 * they must not be claimable as two separate handles.
 *
 * `exceptUserId` lets a user re-save their own handle without colliding
 * with themselves.
 */
export async function isHandleTaken(candidate: string, exceptUserId?: string) {
  const matchesHandle = sql`lower(${user.handle}) = ${candidate.toLowerCase()}`;

  const [row] = await db
    .select({ id: user.id })
    .from(user)
    .where(
      exceptUserId
        ? and(matchesHandle, ne(user.id, exceptUserId))
        : matchesHandle,
    )
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
  let base = slugify(local, MAX_LENGTH);

  // "a@x.com" or "___@x.com" can slugify to something too short for the column.
  if (base.length < MIN_LENGTH) {
    base = `creator-${base}`.replace(/-$/, "");
  }

  if (!(await isHandleTaken(base))) {
    return base;
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const suffix = randomSuffix();
    // Trim the base so base + suffix still fits the column.
    const trimmed = base.slice(0, MAX_LENGTH - suffix.length - 1);
    const candidate = `${trimmed}-${suffix}`;

    if (!(await isHandleTaken(candidate))) {
      return candidate;
    }
  }

  return `creator-${Date.now().toString(36)}${randomSuffix()}`.slice(
    0,
    MAX_LENGTH,
  );
}

import "server-only";

import { cache } from "react";
import { sql } from "drizzle-orm";

import db from "@/lib/server/db";
import { user } from "@/lib/server/db/schemas/auth";
import { getInitials } from "@/lib/utils";

/** The public-facing slice of a `user` row — safe to render on a storefront. */
export type Creator = {
  name: string;
  handle: string;
  image: string | null;
  initials: string;
};

/**
 * Resolves the owner of a storefront from its `[handle]` segment.
 *
 * Handles are generated lowercase (see lib/server/handle.ts) but URLs get typed
 * and shared by humans, so the lookup is case-insensitive: /Test and /test both
 * find the same creator.
 *
 * Wrapped in React `cache` so the storefront layout, the page and
 * `generateMetadata` share a single query per request.
 */
export const getCreatorByHandle = cache(
  async (handle: string): Promise<Creator | null> => {
    const [row] = await db
      .select({ name: user.name, handle: user.handle, image: user.image })
      .from(user)
      .where(sql`lower(${user.handle}) = ${handle.toLowerCase()}`)
      .limit(1);

    if (!row) {
      return null;
    }

    return { ...row, initials: getInitials(row.name) };
  },
);

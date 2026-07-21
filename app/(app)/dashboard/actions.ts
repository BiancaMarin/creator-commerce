"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

import { strings } from "@/constants/strings";
import { handleSchema } from "@/lib/handle-schema";
import { requireUser } from "@/lib/server/dal/session";
import db from "@/lib/server/db";
import { user } from "@/lib/server/db/schemas/auth";
import { isHandleTaken } from "@/lib/server/handle";

export type UpdateHandleResult =
  | { ok: true; handle: string }
  | { ok: false; error: string };

/**
 * Renames the signed-in creator's storefront. The old URL stops resolving
 * immediately — handles are the identity of a store, not an alias, so nothing
 * forwards from the previous one.
 */
export async function updateHandle(input: {
  handle: string;
}): Promise<UpdateHandleResult> {
  // Identity comes from the session, never from the client payload — the form
  // can only ever rename the store belonging to whoever is signed in.
  const current = await requireUser();

  const parsed = handleSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? strings.errors.generic,
    };
  }

  const next = parsed.data.handle;
  // NOT NULL in the database, but optional on Better Auth's session type
  // because the field is declared `required: false` in additionalFields.
  const previous = current.handle ?? "";

  // Re-saving the same handle (or only its casing) is a no-op, not a conflict.
  if (next === previous.toLowerCase()) {
    return { ok: true, handle: next };
  }

  if (await isHandleTaken(next, current.id)) {
    return { ok: false, error: strings.errors.handleTaken };
  }

  await db
    .update(user)
    .set({ handle: next, updatedAt: new Date() })
    .where(eq(user.id, current.id));

  revalidatePath("/dashboard");
  if (previous) {
    revalidatePath(`/${previous}`);
  }
  revalidatePath(`/${next}`);

  return { ok: true, handle: next };
}

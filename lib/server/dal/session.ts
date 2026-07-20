import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/server/auth";

/** Returns the current session, or null when signed out. */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/**
 * Session accessor for pages that must not render to anonymous visitors.
 * Redirects to /login instead of returning null.
 */
export async function requireSession() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

/**
 * The signed-in user, for the common case where the caller needs identity
 * (name, email, handle) and not the session metadata. Redirects to /login
 * when signed out, so the return value is always non-null.
 */
export async function requireUser() {
  const { user } = await requireSession();

  return user;
}

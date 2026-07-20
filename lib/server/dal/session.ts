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

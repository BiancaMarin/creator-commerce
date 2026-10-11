import { neon } from "@neondatabase/serverless";

/**
 * Direct database access for e2e specs — setup checks and cleanup only.
 *
 * Specs drive the app through the browser; this exists so they can verify
 * what landed in the database and remove it afterwards, since the server
 * under test writes to the shared staging branch (see playwright.config.ts).
 */
function sql() {
  const url = process.env.PG_CONNECTION_STRING;

  if (!url) {
    throw new Error(
      "PG_CONNECTION_STRING is not set — e2e specs that write need it to clean up.",
    );
  }

  return neon(url);
}

/**
 * Every user an e2e spec creates has an address of this shape, and nothing
 * else in the app produces one — `example.com` is reserved (RFC 2606) and
 * can't belong to a real person. The deletes below refuse anything else, so a
 * bug in a spec can't remove a real account.
 */
export const E2E_EMAIL_PREFIX = "e2e-signup-";
const E2E_EMAIL_DOMAIN = "@example.com";

/** A unique throwaway address, safe across parallel workers. */
export function e2eEmail() {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  return `${E2E_EMAIL_PREFIX}${id}${E2E_EMAIL_DOMAIN}`;
}

function assertE2eEmail(email: string) {
  if (!email.startsWith(E2E_EMAIL_PREFIX) || !email.endsWith(E2E_EMAIL_DOMAIN)) {
    throw new Error(`Refusing to touch a non-e2e address: ${email}`);
  }
}

export async function findUserByEmail(email: string) {
  // "user" is a reserved word — it has to be quoted.
  const rows = await sql()`
    select id, name, email, handle from "user" where email = ${email}
  `;
  return rows[0] as
    | { id: string; name: string; email: string; handle: string }
    | undefined;
}

/**
 * Deletes e2e users by address. `session` and `account` rows go with them
 * (ON DELETE CASCADE); a fresh signup owns no products or orders, which are
 * the tables that would block the delete.
 */
export async function deleteUsersByEmail(emails: string[]) {
  emails.forEach(assertE2eEmail);

  if (emails.length === 0) {
    return;
  }

  await sql()`delete from "user" where email = any(${emails})`;
}

/**
 * Removes e2e users left behind by a run that crashed before its cleanup.
 * Only rows older than an hour, so it can't pull a user out from under a
 * spec that's running right now in another worker.
 */
export async function sweepStaleE2eUsers() {
  await sql()`
    delete from "user"
    where email like ${`${E2E_EMAIL_PREFIX}%${E2E_EMAIL_DOMAIN}`}
      and created_at < now() - interval '1 hour'
  `;
}

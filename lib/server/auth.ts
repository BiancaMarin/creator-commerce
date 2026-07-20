import "server-only";

// `better-auth/minimal` skips the bundled Kysely adapter. The default entry
// pulls in @better-auth/kysely-adapter, which imports DEFAULT_MIGRATION_TABLE —
// a symbol kysely 0.29 no longer exports — and breaks the Turbopack build.
// We resolve the database through Drizzle, so Kysely is dead weight regardless.
import { betterAuth } from "better-auth/minimal";
import { nextCookies } from "better-auth/next-js";
// Drizzle ORM v1 requires the relations-v2 build of the adapter; the default
// export still emits the pre-1.0 query syntax and fails at runtime.
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";

import db from "@/lib/server/db";
import * as schema from "@/lib/server/db/schemas/auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  // Must stay last so it can flush Set-Cookie from Server Actions.
  plugins: [nextCookies()],
});

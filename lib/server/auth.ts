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
import { sendPasswordResetEmail } from "@/lib/server/emails/password-reset";
import { generateUniqueHandle } from "@/lib/server/handle";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    // Declaring this is what *enables* password reset. Without it Better Auth
    // refuses /request-password-reset with RESET_PASSWORD_DISABLED, so the
    // route and this function are one feature, not two.
    //
    // `url` already contains the token and points at Better Auth's own
    // callback, which validates the token before redirecting on to
    // /reset-password. Don't rebuild it from `token` — the callback is what
    // turns an expired link into a clean error page instead of a form that
    // fails on submit.
    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({ to: user.email, name: user.name, url });
    },
    // One hour, stated explicitly because the copy in
    // `strings.forgotPassword.sent` and `strings.resetPassword` promises it.
    // It happens to match Better Auth's default; leaving it implicit would let
    // a future default change make the app lie to its users.
    resetPasswordTokenExpiresIn: 60 * 60,
    // A reset is what someone does when they suspect they've lost control of
    // the account. Leaving other sessions alive would leave whoever prompted
    // the reset signed in on their own machine.
    revokeSessionsOnPasswordReset: true,
  },
  user: {
    additionalFields: {
      // `required: false` refers to the *input* payload only — Better Auth
      // validates required fields before databaseHooks run, so leaving it true
      // would reject every signup with MISSING_FIELD. The column itself is
      // still NOT NULL; the create hook below is what guarantees a value.
      handle: { type: "string", required: false, unique: true, input: false },
      bio: { type: "string", required: false, input: true },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (newUser) => {
          return {
            data: {
              ...newUser,
              handle: await generateUniqueHandle(newUser.email),
            },
          };
        },
      },
    },
  },
  // Must stay last so it can flush Set-Cookie from Server Actions.
  plugins: [nextCookies()],
});

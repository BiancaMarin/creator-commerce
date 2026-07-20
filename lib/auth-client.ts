import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

// Type-only import: erased at compile time, so the server-only auth module
// never reaches the client bundle. It teaches the client about custom user
// fields (e.g. `handle`) declared in `user.additionalFields`.
import type { auth } from "@/lib/server/auth";

// Same-origin: the route handler lives at /api/auth/[...all], so no baseURL needed.
export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession } = authClient;

import { createAuthClient } from "better-auth/react";

// Same-origin: the route handler lives at /api/auth/[...all], so no baseURL needed.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;

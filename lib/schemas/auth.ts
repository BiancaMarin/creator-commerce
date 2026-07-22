import { z } from "zod";

import { strings } from "@/constants/strings";

/**
 * Credentials handed to Better Auth. The server side of these rules lives in
 * Better Auth itself (`lib/server/auth.ts`), so these schemas exist to catch
 * bad input before the request goes out — not as the only gate.
 *
 * `handle` is absent on purpose: it's derived from the email server-side by
 * the `user.create.before` hook, never submitted at signup.
 */
export const signupSchema = z.object({
  name: z.string().trim().min(1, strings.validation.required),
  email: z.email(strings.validation.invalidEmail),
  password: z.string().min(8, strings.validation.passwordMin),
});

export type SignupValues = z.infer<typeof signupSchema>;

// Deliberately laxer than `signupSchema`: an existing account may predate a
// rule change, and the only thing that decides a login is the server.
export const loginSchema = z.object({
  email: z.email(strings.validation.invalidEmail),
  password: z.string().min(1, strings.validation.required),
});

export type LoginValues = z.infer<typeof loginSchema>;

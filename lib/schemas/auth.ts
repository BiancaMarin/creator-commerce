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

/**
 * The "email me a link" form. Just an address, and deliberately nothing else:
 * the server answers the same way whether or not an account exists, so there
 * is nothing here to validate against.
 */
export const forgotPasswordSchema = z.object({
  email: z.email(strings.validation.invalidEmail),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

/**
 * The new password, typed twice.
 *
 * Matches `signupSchema`'s minimum rather than `loginSchema`'s laxness — this
 * is a password being *set*, so it's the rule that applies to new passwords
 * that matters. Better Auth enforces its own minimum server-side as well;
 * keeping them equal means the browser catches it first and the two never
 * disagree about what's acceptable.
 *
 * The confirmation error is attached to the second field with `path`, so it
 * renders under the input the reader has to change.
 */
export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, strings.validation.passwordMin),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: strings.validation.passwordMismatch,
    path: ["confirmPassword"],
  });

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

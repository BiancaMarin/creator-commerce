import { z } from "zod";

import { strings } from "@/constants/strings";

/** Mirrors the `handle` column: 3–30 chars of [a-z0-9-]. */
export const HANDLE_MIN_LENGTH = 3;
export const HANDLE_MAX_LENGTH = 30;

// Lowercase alphanumeric groups joined by single hyphens — so no leading,
// trailing or doubled hyphens. Matches what generateUniqueHandle produces.
const HANDLE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Shared by the Account form and the `updateHandle` server action, so the
 * client and the server can never disagree on what a valid handle is. Input is
 * normalised (trimmed, lowercased) before the checks run: storefront lookups
 * are case-insensitive, so "Test" and "test" must not be different handles.
 */
export const handleSchema = z.object({
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .min(HANDLE_MIN_LENGTH, strings.validation.handleLength)
    .max(HANDLE_MAX_LENGTH, strings.validation.handleLength)
    .regex(HANDLE_PATTERN, strings.validation.handleFormat),
});

export type HandleValues = z.infer<typeof handleSchema>;

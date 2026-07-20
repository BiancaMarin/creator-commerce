-- `handle` is NOT NULL, but the user table already has rows. Adding the column
-- with a bare NOT NULL would abort, so add it nullable, backfill a unique value
-- derived from the (already unique) id, then tighten the constraint.
ALTER TABLE "user" ADD COLUMN "handle" text;--> statement-breakpoint
UPDATE "user" SET "handle" = 'creator-' || lower("id") WHERE "handle" IS NULL;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "handle" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_handle_key" UNIQUE("handle");

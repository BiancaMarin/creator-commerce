ALTER TABLE "products" DROP CONSTRAINT "products_user_id_slug_key";--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
CREATE UNIQUE INDEX "products_user_id_slug_key" ON "products" ("user_id","slug") WHERE "deleted_at" is null;
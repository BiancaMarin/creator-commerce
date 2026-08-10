CREATE INDEX "products_name_trgm_idx" ON "products" USING gin ("name" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "products_description_trgm_idx" ON "products" USING gin ("description" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX "products_created_at_idx" ON "products" ("created_at" DESC NULLS LAST) WHERE "deleted_at" is null;
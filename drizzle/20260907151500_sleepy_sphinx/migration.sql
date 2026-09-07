ALTER TABLE "products" ADD COLUMN "file_key" varchar(512);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "file_name" varchar(255);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "file_size" integer;--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "files";
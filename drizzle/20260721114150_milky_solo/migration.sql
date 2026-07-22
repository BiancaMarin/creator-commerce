ALTER TABLE "products" ADD COLUMN "user_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "slug" varchar(60) NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "tag" varchar(60) NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "description" text NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "files" varchar(160);--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "price" SET DATA TYPE numeric(10,2) USING "price"::numeric(10,2);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "currency" SET DATA TYPE varchar(3) USING "currency"::varchar(3);--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "currency" SET DEFAULT 'USD';--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_user_id_slug_key" UNIQUE("user_id","slug");--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
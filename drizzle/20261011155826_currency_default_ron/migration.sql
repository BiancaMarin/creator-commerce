ALTER TABLE "order_items" ALTER COLUMN "currency" SET DEFAULT 'RON';--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "currency" SET DEFAULT 'RON';--> statement-breakpoint
ALTER TABLE "products" ALTER COLUMN "currency" SET DEFAULT 'RON';
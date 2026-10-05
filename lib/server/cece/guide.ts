import "server-only";

import type { CeceHelpTopic } from "@/lib/schemas/cece";
import { MAX_PRODUCT_FILE_BYTES, MAX_PRODUCT_IMAGES } from "@/lib/schemas/product";
import { PLATFORM_FEE_PERCENT } from "@/lib/store-data";
import { formatFileSize } from "@/lib/utils";

/**
 * What CECE knows about using the platform, one entry per `get_help` topic.
 *
 * A tool rather than a block of system prompt, for two reasons. The prompt is
 * paid for on every message, while a topic is only loaded when someone asks.
 * And an MCP client gets none of our system prompt, only our tools, so help
 * that lived in the prompt would be missing from every external integration.
 *
 * **Describe only what exists.** This is the one place CECE can be confidently
 * wrong on the platform's behalf: a step that names a button nobody built reads
 * as a bug to the person following it. Analytics, Wishlist and Settings are
 * placeholders today and are described as such. When a feature ships or
 * changes, update its topic in the same change.
 */

export type HelpLink = { label: string; href: string };

export type HelpArticle = {
  title: string;
  steps: string[];
  notes?: string[];
  links: HelpLink[];
};

const maxFileSize = formatFileSize(MAX_PRODUCT_FILE_BYTES);

export const HELP_ARTICLES: Record<CeceHelpTopic, HelpArticle> = {
  getting_started: {
    title: "Getting started",
    steps: [
      "Every account can both sell and buy. The sidebar is split into Selling (Products, Orders, Customers, Analytics) and Buying (Explore, Wishlist, Downloads, Cart).",
      "To start selling, create your first product from Products → New product. It goes live on your storefront as soon as you save it.",
      "Your storefront is at /your-handle. Change the handle in Dashboard → Account.",
      "The Dashboard shows revenue, orders and customers for the last 30 days against the 30 before.",
    ],
    notes: [
      "Analytics, Wishlist and Settings are placeholder screens for now; they don't show your real data yet.",
    ],
    links: [
      { label: "New product", href: "/products/new" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },

  create_product: {
    title: "Creating a product",
    steps: [
      "Go to Products and click New product.",
      `Your product: upload the file buyers will download (up to ${maxFileSize}), then add up to ${MAX_PRODUCT_IMAGES} images. The first image is the cover.`,
      "Details: a name (3+ characters), a type such as \"Lightroom presets\", and a description (10 to 2,000 characters). AI can fill these in for you from the file.",
      "Price: a positive amount in USD with at most two decimals. The form shows what you keep after the platform fee.",
      "Save. The product is live on your storefront immediately.",
    ],
    links: [{ label: "New product", href: "/products/new" }],
  },

  edit_or_delete_product: {
    title: "Editing or deleting a product",
    steps: [
      "Go to Products. Each row has Edit and Delete.",
      "Edit opens the same form as creating. Saving updates the live listing; renaming it changes the last part of its URL, and old links still work because they are matched by id.",
      "Delete asks for confirmation and removes the product from your storefront and from Explore right away.",
    ],
    notes: [
      "Deleting never takes a product away from people who already bought it: it stays in their Downloads.",
      "Deleting frees the product's URL, so you can create a new one with the same name.",
    ],
    links: [{ label: "Products", href: "/products" }],
  },

  product_files_and_images: {
    title: "Product files and images",
    steps: [
      `The product file can be any type (PDF, zip, presets, video…) up to ${maxFileSize}. Buyers download it from their Downloads page after paying.`,
      `Images are optional, up to ${MAX_PRODUCT_IMAGES} per product, 4 MB each. The first one is the cover on your storefront and in Explore.`,
      "Without an image, the product shows a generated cover.",
    ],
    notes: [
      "Download links are checked on every click: only someone with a paid order for the product can get the file.",
      "Older products may have no file attached. Edit them and upload one, or buyers will have nothing to download.",
    ],
    links: [{ label: "Products", href: "/products" }],
  },

  ai_drafts: {
    title: "AI-written product details",
    steps: [
      "On the product form, once the product file is uploaded, AI drafts the name, type and description from the file and the cover image.",
      "It only fills fields you left empty; it never renames a product you already named.",
      "Click Fill in with AI in the Details section to redraft on demand. That button replaces the description.",
      "Nothing is saved until you click save, so you can edit or discard the draft.",
    ],
    notes: [
      "PDFs, images and text files (txt, md, csv, json) up to 10 MB are read. Other files, like zips or videos, are described from their name and size only.",
    ],
    links: [{ label: "New product", href: "/products/new" }],
  },

  pricing_and_fees: {
    title: "Pricing and fees",
    steps: [
      "Prices are set per product in USD.",
      `The platform fee is a flat ${PLATFORM_FEE_PERCENT}% of each sale. Buyers pay the list price; the product form shows your estimated take-home.`,
      "Payments are taken by Stripe Checkout. An order only counts as paid, and only shows up in revenue, once Stripe confirms the payment.",
    ],
    notes: [
      "Automated payouts to creators aren't set up yet.",
    ],
    links: [{ label: "Products", href: "/products" }],
  },

  storefront_and_handle: {
    title: "Your storefront and handle",
    steps: [
      "Your public storefront lives at /your-handle and lists all your live products.",
      "Each product has its own page at /your-handle/product-id/product-name.",
      "To change your handle, open Dashboard → Account, type a new one and save.",
    ],
    notes: [
      "Changing your handle changes your storefront URL straight away. The old URL stops working, so links you've shared will break.",
    ],
    links: [{ label: "Dashboard", href: "/dashboard" }],
  },

  orders_and_customers: {
    title: "Orders and customers",
    steps: [
      "Orders lists every sale of your products, newest first. A cart can include several creators' products, so you only see your own lines.",
      "Status: paid means Stripe confirmed the payment; pending means the buyer reached the payment page but hasn't finished. Abandoned checkouts are cleared automatically.",
      "Customers lists everyone who has paid you, biggest spender first, with how much they spent with you.",
    ],
    links: [
      { label: "Orders", href: "/orders" },
      { label: "Customers", href: "/customers" },
    ],
  },

  buying_and_downloads: {
    title: "Buying and downloading",
    steps: [
      "Find products in Explore or on a creator's storefront. Use Buy for one product, or Add to cart to pay for several at once.",
      "Checkout happens on Stripe. After paying you're sent to Downloads.",
      "Downloads lists everything you've bought. Click a product to download its file, as many times as you like.",
    ],
    notes: [
      "You can't buy your own products, or buy something twice.",
      "If a purchase shows as pending, the payment is still being confirmed.",
    ],
    links: [
      { label: "Explore", href: "/explore" },
      { label: "Downloads", href: "/downloads" },
      { label: "Cart", href: "/cart" },
    ],
  },

  explore_marketplace: {
    title: "Exploring the marketplace",
    steps: [
      "Explore searches every creator's products. Type at least 3 characters to search names and descriptions.",
      "Filter by product type or a price range, and sort by newest or oldest.",
    ],
    links: [{ label: "Explore", href: "/explore" }],
  },
};

import "server-only";

import type { z } from "zod";

import {
  emptyInput,
  getHelpInput,
  getMyProductInput,
  listMyProductsInput,
  listRecentOrdersInput,
  listTopCustomersInput,
  searchMarketplaceInput,
} from "@/lib/schemas/cece";
import { HELP_ARTICLES } from "@/lib/server/cece/guide";
import { getCreatorById } from "@/lib/server/dal/creators";
import {
  getProductSalesForSeller,
  getSellerStats,
  listCustomersForSeller,
  listOrdersForSeller,
  listPurchasesForBuyer,
  listTopProductsForSeller,
} from "@/lib/server/dal/orders";
import {
  getCatalogHealthForUser,
  getProductForUser,
  searchProducts,
  searchProductsForUser,
} from "@/lib/server/dal/products";
import { formatCents, toCents } from "@/lib/server/money";

/**
 * CECE's tools, defined once and independent of how they're called.
 *
 * Nothing here imports the AI SDK. A definition is a name, a description, a
 * zod input schema and an `execute` — exactly the shape of an MCP tool — so the
 * in-app chat (lib/server/cece/chat.ts adapts these to AI SDK tools) and a
 * future MCP server can expose the same set without either owning it.
 *
 * Three rules every tool here follows:
 *
 * 1. **Identity comes from `CeceContext`, never from the input.** The model
 *    fills the input, and the model can be talked into anything; no schema in
 *    lib/schemas/cece.ts has a user id in it, so there's nothing to talk it
 *    into. Each transport resolves the context from its own auth — the session
 *    cookie for the chat, a token for MCP.
 * 2. **Read-only.** A write would need a confirmation step the user sees
 *    before it runs (the AI SDK's `needsApproval`, MCP's elicitation). Until
 *    that exists, CECE explains how to change things and links to the page.
 * 3. **Return only what the model needs.** Everything here is sent to a model
 *    provider. Buyer email addresses are left out on purpose: the seller can
 *    see them on /customers, and CECE has no use for them.
 */

/** Who a tool acts for. The only source of identity a tool may use. */
export type CeceContext = { userId: string };

export type CeceTool<INPUT extends z.ZodType = z.ZodType, OUTPUT = unknown> = {
  /** Human-readable name, for MCP clients that list tools to people. */
  title: string;
  /** For the model: what the tool returns and when to call it. */
  description: string;
  inputSchema: INPUT;
  execute: (input: z.output<INPUT>, context: CeceContext) => Promise<OUTPUT>;
};

/** Keeps each definition's input and output types instead of widening them. */
function defineTool<INPUT extends z.ZodType, OUTPUT>(
  definition: CeceTool<INPUT, OUTPUT>,
) {
  return definition;
}

/** Most search hits handed to the model — enough to answer, few enough to read. */
const MARKETPLACE_RESULT_LIMIT = 10;

/** Most purchases listed; a library bigger than this is summarized by count. */
const PURCHASE_LIMIT = 25;

/**
 * Other creators' descriptions are cut short: they're free text nobody here
 * wrote, and every character is prompt the model reads — including any
 * instructions someone typed into a listing hoping a model would follow them.
 */
const FOREIGN_DESCRIPTION_LENGTH = 200;

/** Dates as the model reads them best: a plain calendar day. */
function day(date: Date | null) {
  return date ? date.toISOString().slice(0, 10) : null;
}

function truncate(text: string, length: number) {
  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}

/** A `numeric` product price as money, e.g. "48.00" → "$48.00". */
function formatPrice(price: string, currency: string) {
  return formatCents(toCents(price), currency);
}

async function handleOf(userId: string) {
  return (await getCreatorById(userId))?.handle ?? null;
}

export const CECE_TOOLS = {
  get_help: defineTool({
    title: "Platform help",
    description:
      "Step-by-step instructions for using Creator Commerce, with links to the right pages. Call this before explaining how to do anything on the platform, rather than answering from memory.",
    inputSchema: getHelpInput,
    execute: async ({ topic }) => HELP_ARTICLES[topic],
  }),

  get_account_overview: defineTool({
    title: "Account overview",
    description:
      "The user's name, storefront handle and URL, and what's incomplete in their catalog (products without a downloadable file or images). Good first call when the user is stuck and it's unclear why.",
    inputSchema: emptyInput,
    execute: async (_input, { userId }) => {
      const [creator, catalog] = await Promise.all([
        getCreatorById(userId),
        getCatalogHealthForUser(userId),
      ]);

      return {
        name: creator?.name ?? null,
        handle: creator?.handle ?? null,
        storefrontPath: creator ? `/${creator.handle}` : null,
        catalog,
      };
    },
  }),

  list_my_products: defineTool({
    title: "My products",
    description:
      "The user's own live products, newest first, optionally filtered by name. Use it to find a product's id before calling get_my_product.",
    inputSchema: listMyProductsInput,
    execute: async ({ query }, { userId }) => {
      const [products, handle] = await Promise.all([
        searchProductsForUser(userId, query ?? ""),
        handleOf(userId),
      ]);

      return products.map((product) => ({
        id: product.id,
        name: product.name,
        type: product.tag,
        price: formatPrice(product.price, product.currency),
        hasFile: product.fileKey !== null,
        images: product.imageUrls.length,
        createdOn: day(product.createdAt),
        editPath: `/products/${product.id}`,
        storefrontPath: handle
          ? `/${handle}/${product.id}/${product.slug}`
          : null,
      }));
    },
  }),

  get_my_product: defineTool({
    title: "Product details",
    description:
      "One of the user's own products in full, with its sales: units sold, revenue and when it last sold.",
    inputSchema: getMyProductInput,
    execute: async ({ productId }, { userId }) => {
      const [product, sales, handle] = await Promise.all([
        getProductForUser(productId, userId),
        getProductSalesForSeller(userId, productId),
        handleOf(userId),
      ]);

      if (!product) {
        return { found: false as const };
      }

      return {
        found: true as const,
        id: product.id,
        name: product.name,
        type: product.tag,
        description: product.description,
        price: formatPrice(product.price, product.currency),
        file: product.fileName,
        images: product.imageUrls.length,
        createdOn: day(product.createdAt),
        updatedOn: day(product.updatedAt),
        sales: {
          units: sales.sales,
          revenue: formatCents(sales.revenue, product.currency),
          lastSoldOn: day(sales.lastSoldAt),
        },
        editPath: `/products/${product.id}`,
        storefrontPath: handle
          ? `/${handle}/${product.id}/${product.slug}`
          : null,
      };
    },
  }),

  get_sales_summary: defineTool({
    title: "Sales summary",
    description:
      "The user's paid sales as a seller: revenue, orders and customers for the last 30 days and the 30 before, all-time revenue, and their best-selling products.",
    inputSchema: emptyInput,
    execute: async (_input, { userId }) => {
      const [stats, topProducts] = await Promise.all([
        getSellerStats(userId),
        listTopProductsForSeller(userId, 5),
      ]);

      return {
        last30Days: {
          revenue: formatCents(stats.revenue),
          orders: stats.orders,
          customers: stats.customers,
        },
        previous30Days: {
          revenue: formatCents(stats.revenuePrevious),
          orders: stats.ordersPrevious,
          customers: stats.customersPrevious,
        },
        allTimeRevenue: formatCents(stats.revenueAllTime),
        topProducts: topProducts.map((product) => ({
          productId: product.productId,
          name: product.name,
          unitsSold: product.sales,
          revenue: formatCents(product.revenue),
        })),
      };
    },
  }),

  list_recent_orders: defineTool({
    title: "Recent orders",
    description:
      "The latest order lines for the user's products, newest first, including pending checkouts that haven't been paid.",
    inputSchema: listRecentOrdersInput,
    execute: async ({ limit }, { userId }) => {
      const orders = await listOrdersForSeller(userId, limit ?? 10);

      return orders.map((order) => ({
        orderId: order.orderId,
        date: day(order.createdAt),
        status: order.status,
        buyer: order.buyerName,
        product: order.productName,
        amount: formatCents(order.amount, order.currency),
      }));
    },
  }),

  list_top_customers: defineTool({
    title: "Top customers",
    description:
      "The people who have spent the most on the user's products (paid orders only), with order count and last purchase date.",
    inputSchema: listTopCustomersInput,
    execute: async ({ limit }, { userId }) => {
      const customers = await listCustomersForSeller(userId, limit ?? 5);

      return customers.map((customer) => ({
        name: customer.name,
        orders: customer.orders,
        spent: formatCents(customer.spent, customer.currency),
        lastPurchaseOn: day(customer.lastOrderAt),
      }));
    },
  }),

  list_my_purchases: defineTool({
    title: "My purchases",
    description:
      "What the user has bought from other creators, newest first, with where to download each one.",
    inputSchema: emptyInput,
    execute: async (_input, { userId }) => {
      const purchases = await listPurchasesForBuyer(userId);

      return {
        total: purchases.length,
        purchases: purchases.slice(0, PURCHASE_LIMIT).map((purchase) => ({
          productId: purchase.productId,
          name: purchase.productName,
          creator: `@${purchase.handle}`,
          paid: formatCents(purchase.amount, purchase.currency),
          purchasedOn: day(purchase.paidAt ?? purchase.startedAt),
          // Null for a product that predates product files: there's nothing
          // to download, and the model should say so rather than link a 404.
          hasFile: purchase.fileName !== null,
        })),
        downloadsPath: "/downloads",
      };
    },
  }),

  search_marketplace: defineTool({
    title: "Search the marketplace",
    description:
      "Search every creator's products, as on the Explore page. Returns the newest matches with links.",
    inputSchema: searchMarketplaceInput,
    execute: async ({ query, type, maxPrice }) => {
      const results = await searchProducts(
        query ?? "",
        "newest",
        type ?? "",
        "",
        maxPrice === undefined ? "" : maxPrice.toFixed(2),
      );

      return results.slice(0, MARKETPLACE_RESULT_LIMIT).map((product) => ({
        name: product.name,
        creator: `@${product.handle}`,
        type: product.tag,
        price: formatPrice(product.price, product.currency),
        description: truncate(product.description, FOREIGN_DESCRIPTION_LENGTH),
        path: `/${product.handle}/${product.id}/${product.slug}`,
      }));
    },
  }),
};

export type CeceToolName = keyof typeof CECE_TOOLS;

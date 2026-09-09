import "server-only";

import { strings } from "@/constants/strings";
import type { OrderReceipt } from "@/lib/server/dal/orders";
import { sendEmail } from "@/lib/server/email";
import { formatCents } from "@/lib/server/money";
import { appOrigin } from "@/lib/server/origin";

const copy = strings.email.receipt;

/**
 * Escapes text destined for the HTML part.
 *
 * Product names are seller-controlled free text, and the HTML body is the one
 * place in this app where such a string is concatenated into markup rather than
 * rendered by React. A name containing `<script>` would otherwise arrive live
 * in the buyer's mail client — most of them refuse to run it, which is a
 * mitigation belonging to someone else's software, not a reason to emit it.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Emails the buyer their receipt.
 *
 * **Call this only from the branch that promoted the order**, in
 * `fulfillCheckoutSession`. That branch is the single point in the app that
 * runs exactly once per paid order — the webhook and the return-URL
 * reconciliation both funnel through `markOrderPaid`, whose `status =
 * 'pending'` predicate lets only one of them win. Anywhere else and Stripe's
 * ordinary event redelivery mails the buyer the same receipt repeatedly.
 *
 * Sent to `orders.email`, the address recorded at checkout, not to the account
 * address. The buyer can change the recipient on Stripe's own page, and the
 * receipt should follow what they typed there.
 *
 * Like `sendEmail`, this never throws: the order is already paid and the money
 * already taken by the time it runs, so nothing here may propagate an error
 * into the webhook and provoke a retry of work that is finished.
 *
 * This is *not* the charge receipt. Stripe sends that one, if enabled in the
 * dashboard. This is the delivery notice — its job is the link to the library.
 */
export async function sendOrderReceipt(order: OrderReceipt): Promise<void> {
  try {
    const downloads = `${appOrigin()}/downloads`;
    const total = formatCents(order.amountTotal, order.currency);
    const lines = order.items.map(
      (item) => `${item.name} — ${formatCents(item.unitAmount, order.currency)}`,
    );

    await sendEmail({
      to: order.email,
      subject: copy.subject.replace("{order}", String(order.id)),
      text: [
        copy.heading,
        "",
        copy.intro,
        "",
        `${copy.itemsHeading}:`,
        ...lines.map((line) => `  ${line}`),
        "",
        `${copy.total}: ${total}`,
        "",
        copy.cta.replace("{url}", downloads),
        "",
        copy.footer,
      ].join("\n"),
      html: [
        `<h1 style="font:600 20px system-ui,sans-serif">${copy.heading}</h1>`,
        `<p style="font:400 15px/1.5 system-ui,sans-serif">${copy.intro}</p>`,
        `<h2 style="font:600 14px system-ui,sans-serif">${copy.itemsHeading}</h2>`,
        `<ul style="font:400 15px/1.6 system-ui,sans-serif">`,
        ...order.items.map(
          (item) =>
            `<li>${escapeHtml(item.name)} — ${formatCents(item.unitAmount, order.currency)}</li>`,
        ),
        `</ul>`,
        `<p style="font:600 15px system-ui,sans-serif">${copy.total}: ${total}</p>`,
        // Styled inline, because email clients strip <style> blocks and none of
        // them load an external stylesheet. The app's Tailwind tokens can't
        // reach here at all.
        `<p><a href="${downloads}" style="font:600 15px system-ui,sans-serif">${downloads}</a></p>`,
        `<p style="font:400 13px system-ui,sans-serif;color:#666">${copy.footer}</p>`,
      ].join("\n"),
    });
  } catch (error) {
    // Reached only if composing the message threw — `sendEmail` swallows its
    // own transport failures. `appOrigin()` throwing on a missing
    // BETTER_AUTH_URL is the realistic case.
    console.error(`[email] could not build receipt for order ${order.id}`, error);
  }
}

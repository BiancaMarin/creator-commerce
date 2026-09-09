import "server-only";

import { strings } from "@/constants/strings";
import { sendEmail } from "@/lib/server/email";

const copy = strings.email.passwordReset;

/**
 * Escapes text destined for the HTML part. Same reasoning as the receipt's
 * copy: a name is user-supplied free text, and this is markup being
 * concatenated rather than rendered by React.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Emails a one-time password reset link.
 *
 * Called by Better Auth's `sendResetPassword` hook, which is the only thing
 * that may call it: the `url` carries a token Better Auth minted and stored,
 * and there is no other way to obtain a valid one.
 *
 * **This email is the second factor of the whole flow.** The form that triggers
 * it accepts any address and always answers the same way, so the only thing
 * separating a stranger from an account is that the link lands in an inbox they
 * do not control. That is why the body says plainly that ignoring it is safe:
 * for the person who did not ask, receiving this must be a non-event.
 *
 * Never mention whether the address matched an account anywhere else — the
 * silence is what stops the form being used to enumerate registered users.
 */
export async function sendPasswordResetEmail({
  to,
  name,
  url,
}: {
  to: string;
  name: string;
  url: string;
}): Promise<void> {
  await sendEmail({
    to,
    subject: copy.subject,
    text: [
      copy.heading,
      "",
      copy.intro.replace("{name}", name),
      "",
      copy.cta.replace("{url}", url),
      "",
      copy.expiry,
      copy.ignore,
    ].join("\n"),
    html: [
      `<h1 style="font:600 20px system-ui,sans-serif">${copy.heading}</h1>`,
      `<p style="font:400 15px/1.5 system-ui,sans-serif">${escapeHtml(copy.intro.replace("{name}", name))}</p>`,
      // Inline styles only: mail clients strip <style> blocks and load no
      // external stylesheet, so the app's Tailwind tokens can't reach here.
      `<p><a href="${url}" style="font:600 15px system-ui,sans-serif">${copy.linkLabel}</a></p>`,
      `<p style="font:400 13px/1.5 system-ui,sans-serif;color:#666">${copy.expiry}<br />${copy.ignore}</p>`,
    ].join("\n"),
  });
}

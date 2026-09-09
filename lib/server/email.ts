import "server-only";

import nodemailer, { type Transporter } from "nodemailer";

/**
 * One outbound message. Deliberately the smallest useful shape: a caller
 * describes *what* to send and never *how*, so swapping Gmail for a real
 * sending service later touches this file only.
 *
 * `text` is required and `html` optional, not the other way round. A plain-text
 * part is what every client can render and what keeps a message out of the spam
 * folder that an HTML-only body invites; the HTML is the enhancement.
 */
export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  /** Where a reply should go, when that isn't the sending mailbox. */
  replyTo?: string;
};

/** What a send did, for a caller that wants to log or surface it. */
export type EmailResult = {
  /** False when the transport refused it — never a thrown error. */
  sent: boolean;
  /** Which transport handled it, so logs say whether mail really left. */
  transport: EmailTransport;
  /** SMTP's id for the message. Absent on the console transport. */
  messageId?: string;
};

export type EmailTransport = "gmail" | "console";

/**
 * Which transport this process will use, decided once from the environment.
 *
 * **Gmail requires both variables; anything else logs.** Falling back rather
 * than throwing is the point of this module: a developer with no credentials
 * gets a working app whose emails land in the terminal, and the signup or
 * checkout flow that triggered one is never blocked by mail configuration.
 *
 * `EMAIL_TRANSPORT=console` forces the fallback even when credentials exist —
 * how you work against production-shaped config without mailing real people.
 */
export function emailTransport(): EmailTransport {
  if (process.env.EMAIL_TRANSPORT === "console") {
    return "console";
  }

  return process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
    ? "gmail"
    : "console";
}

/**
 * The address messages are sent from.
 *
 * Gmail **rewrites this to the authenticated account** unless the address is a
 * verified alias on it, so `EMAIL_FROM` changes the display name in practice
 * and not the mailbox. Set it for the name; don't expect it to change who the
 * mail appears to come from.
 */
function fromAddress(): string {
  if (process.env.EMAIL_FROM) {
    return process.env.EMAIL_FROM;
  }

  // The placeholder is only reachable on the console transport — the Gmail one
  // exists precisely because GMAIL_USER is set — and keeps the logged envelope
  // a readable address rather than an empty pair of brackets.
  const mailbox = process.env.GMAIL_USER || "dev@localhost";

  return `Creator Commerce <${mailbox}>`;
}

/**
 * The SMTP connection, built once and reused.
 *
 * Nodemailer pools nothing by default but does hold the connection open for a
 * short while, and a transporter per send would mean a fresh TLS handshake and
 * Gmail login for every message. Module scope is the right lifetime here: it
 * survives across requests in a warm server, and a cold start simply builds a
 * new one.
 */
let transporter: Transporter | null = null;

function gmailTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        // An **app password**, not the account password. Google refuses plain
        // passwords over SMTP; the 16-character app password (which requires
        // 2-Step Verification on the account) is the only credential that works.
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }

  return transporter;
}

/**
 * Sends one email, or logs it when no Gmail credentials are configured.
 *
 * **This never throws and never rejects.** Callers sit on paths where mail is
 * the least important thing happening — an order was just paid, an account was
 * just created — and a mail server having a bad minute must not fail the write
 * that earned the email. A refused send returns `sent: false` and is logged;
 * deciding whether that matters is the caller's business, and mostly it
 * doesn't.
 *
 * The console transport is not a stub. It prints the exact envelope and body
 * that Gmail would have carried, which is what makes it useful for checking
 * copy and merge fields before any credential exists.
 */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  const transport = emailTransport();

  if (transport === "console") {
    console.info(
      [
        "[email] (console transport — nothing was sent)",
        `  to:      ${message.to}`,
        `  from:    ${fromAddress()}`,
        message.replyTo ? `  replyTo: ${message.replyTo}` : null,
        `  subject: ${message.subject}`,
        "  ---",
        message.text.replace(/^/gm, "  "),
      ]
        .filter(Boolean)
        .join("\n"),
    );

    return { sent: true, transport };
  }

  try {
    const info = await gmailTransporter().sendMail({
      from: fromAddress(),
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
      replyTo: message.replyTo,
    });

    console.info(`[email] sent "${message.subject}" to ${message.to}`);

    return { sent: true, transport, messageId: info.messageId };
  } catch (error) {
    console.error(`[email] could not send "${message.subject}"`, error);

    return { sent: false, transport };
  }
}

/**
 * Opens and closes an SMTP connection to prove the credentials work.
 *
 * Worth having separately because a bad app password is otherwise invisible
 * until the first real email silently fails — and `sendEmail` swallowing that
 * failure is exactly what makes a dedicated check necessary. Returns `true`
 * unconditionally on the console transport: there is nothing to verify.
 */
export async function verifyEmailTransport(): Promise<boolean> {
  if (emailTransport() === "console") {
    return true;
  }

  try {
    await gmailTransporter().verify();

    return true;
  } catch (error) {
    console.error("[email] SMTP verification failed", error);

    return false;
  }
}

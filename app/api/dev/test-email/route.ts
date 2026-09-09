import { emailTransport, sendEmail, verifyEmailTransport } from "@/lib/server/email";

/**
 * Sends one throwaway email, so the mail setup can be checked without waiting
 * for a real order.
 *
 *     curl "localhost:3000/api/dev/test-email?to=you@example.com"
 *
 * With no Gmail credentials the message is printed to the terminal by the
 * console transport, which is the point: the wiring can be exercised before any
 * credential exists. With them, it proves the app password actually
 * authenticates — `sendEmail` swallows send failures by design, so
 * `verifyEmailTransport` is what turns a bad password into a visible answer
 * here.
 *
 * **Development only.** In production it 404s rather than 403ing: an endpoint
 * that mails an arbitrary address on an unauthenticated GET is an open relay
 * for anyone who finds it, and the safest deployed version of it is one that
 * doesn't appear to exist.
 */
export async function GET(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return new Response("Not found", { status: 404 });
  }

  const to = new URL(request.url).searchParams.get("to");

  if (!to) {
    return Response.json({ error: "Pass ?to=someone@example.com" }, { status: 400 });
  }

  const verified = await verifyEmailTransport();
  const result = await sendEmail({
    to,
    subject: "Creator Commerce test email",
    text: [
      "This is a test message from your local Creator Commerce server.",
      "",
      `Transport: ${emailTransport()}`,
      `Sent at:   ${new Date().toISOString()}`,
    ].join("\n"),
    html: `<p>This is a test message from your local Creator Commerce server.</p>
<p>Transport: <strong>${emailTransport()}</strong><br />Sent at: ${new Date().toISOString()}</p>`,
  });

  return Response.json({ ...result, verified });
}

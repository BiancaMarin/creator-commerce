import { ceceRequestSchema } from "@/lib/schemas/cece";
import { streamCeceReply } from "@/lib/server/cece/chat";
import { getSession } from "@/lib/server/dal/session";

/**
 * CECE's chat endpoint, called by `useChat` in components/cece/cece-panel.tsx.
 *
 * A route handler rather than a Server Action because the reply is a stream:
 * the AI SDK's UI message protocol is server-sent events over one long POST,
 * which a Server Action can't return.
 *
 * Several tool round trips on a free-tier model can take a while, so the
 * default function duration is raised. `MAX_STEPS` in lib/server/cece/chat.ts
 * is what actually bounds a turn.
 */
export const maxDuration = 60;

export async function POST(request: Request) {
  // `getSession()`, not `requireUser()`: a redirect means nothing to a fetch.
  // The (app) layout already sent anonymous visitors to /login, so reaching
  // this signed out means the session expired with the panel open.
  const session = await getSession();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = ceceRequestSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!body.success) {
    return new Response("Invalid request", { status: 400 });
  }

  // Identity from the session and nothing else. The body carries only the
  // conversation and a page hint; no field in it names a user.
  return streamCeceReply({
    context: { userId: session.user.id },
    name: session.user.name,
    messages: body.data.messages,
    pathname: body.data.pathname,
  });
}

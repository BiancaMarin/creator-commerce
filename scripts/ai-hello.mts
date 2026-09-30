/**
 * Smoke test for the Vercel AI Gateway: one prompt, one reply, printed.
 *
 * Proves the key and the network path work before any AI feature is wired into
 * the app. A plain model string ("anthropic/…") routes through the gateway by
 * default in the AI SDK, so there is no provider package to install.
 *
 *   npm run ai:hello
 *   npm run ai:hello -- "Say hi in Romanian"          # custom prompt
 *   AI_MODEL=openai/gpt-5 npm run ai:hello            # different model
 *
 * Auth is read from the environment by the SDK itself: `AI_GATEWAY_API_KEY`
 * (a key from Vercel → AI Gateway → API Keys), or failing that
 * `VERCEL_OIDC_TOKEN` from `vercel env pull`. The OIDC token expires after
 * about 12 hours, so the API key is the one to keep in `.env` for scripts.
 */

import { generateText } from "ai";

// A model the Gateway's free tier allows. Free credits exclude the larger models
// (Claude included) — those answer "Free tier users do not have access to this
// model" until the account is topped up with paid credits.
const DEFAULT_MODEL = "google/gemini-2.5-flash";

if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
  console.error(
    "No AI Gateway credentials — set AI_GATEWAY_API_KEY in .env (the SDK does not read VERCEL_AI_GATEWAY).",
  );
  process.exit(1);
}

const model = process.env.AI_MODEL ?? DEFAULT_MODEL;
const prompt =
  process.argv.slice(2).join(" ") ||
  "Say hello and tell me, in one sentence, which model you are.";

const started = Date.now();

try {
  const { text, usage } = await generateText({ model, prompt });

  console.log(text);
  console.log("");
  console.log(
    `${model} · ${usage.inputTokens ?? "?"} in / ${usage.outputTokens ?? "?"} out tokens · ${Date.now() - started} ms`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}

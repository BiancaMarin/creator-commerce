import type { Metadata } from "next";
import {
  ArrowDownIcon,
  BrowserIcon,
  CreditCardIcon,
  DatabaseIcon,
  FileArrowDownIcon,
  GlobeIcon,
  RobotIcon,
  StackIcon,
  TreeStructureIcon,
} from "@phosphor-icons/react/dist/ssr";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { getStrings } from "@/lib/server/i18n";
import { toneAt } from "@/lib/tones";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const strings = await getStrings();
  return {
    title: `${strings.marketing.docs.title} · ${strings.store.brand}`,
    description: strings.marketing.docs.subtitle,
  };
}

const headingClass = "font-heading font-semibold tracking-[-0.03em]";

// Product names aren't copy, so they stay here; only the group headings are
// translated. Keep in step with package.json and the CLAUDE.md stack table.
const stack = [
  {
    key: "frontend",
    items: [
      "Next.js 16",
      "React 19",
      "TypeScript",
      "Tailwind CSS v4",
      "shadcn / Base UI",
      "Phosphor Icons",
    ],
  },
  {
    key: "backend",
    items: [
      "Server Actions",
      "Neon Postgres",
      "Drizzle ORM",
      "Zod",
      "React Hook Form",
    ],
  },
  { key: "auth", items: ["Better Auth", "Stripe Checkout", "Stripe webhooks"] },
  { key: "files", items: ["UploadThing", "Nodemailer (Gmail)"] },
  {
    key: "ai",
    items: ["Vercel AI SDK", "Vercel AI Gateway", "Gemini 2.5 Flash"],
  },
  { key: "quality", items: ["PostHog", "Vitest", "Playwright", "Vercel"] },
] as const;

const services = [
  "Neon",
  "Stripe",
  "UploadThing",
  "AI Gateway",
  "PostHog",
  "Gmail",
] as const;

export default async function DocsPage() {
  const strings = await getStrings();
  const docs = strings.marketing.docs;

  const layers = [
    { icon: BrowserIcon, title: docs.layers.client, detail: docs.layers.clientDetail },
    { icon: StackIcon, title: docs.layers.app, detail: docs.layers.appDetail },
    { icon: DatabaseIcon, title: docs.layers.data, detail: docs.layers.dataDetail },
  ];

  const points = [
    { icon: TreeStructureIcon, ...docs.points.routes },
    { icon: DatabaseIcon, ...docs.points.data },
    { icon: CreditCardIcon, ...docs.points.payments },
    { icon: FileArrowDownIcon, ...docs.points.downloads },
    { icon: RobotIcon, ...docs.points.ai },
    { icon: GlobeIcon, ...docs.points.i18n },
  ];

  return (
    <>
      <MarketingNav />

      <main className="mx-auto flex max-w-[1120px] flex-col gap-16 px-4 py-16 sm:px-8">
        <header className="flex flex-col gap-3">
          <h1 className={`${headingClass} text-brand-gradient text-4xl sm:text-5xl`}>
            {docs.title}
          </h1>
          <p className="max-w-[560px] text-lg text-muted-foreground">
            {docs.subtitle}
          </p>
        </header>

        <section className="flex flex-col gap-6">
          <h2 className={`${headingClass} text-2xl sm:text-3xl`}>
            {docs.stackTitle}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stack.map((group, index) => (
              <Card
                key={group.key}
                size="sm"
                className={cn("px-5", toneAt(index).wash)}
              >
                <h3 className={cn("text-sm font-semibold", toneAt(index).text)}>
                  {docs.groups[group.key]}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {group.items.map((item) => (
                    <Badge key={item} variant="outline" className="bg-background">
                      {item}
                    </Badge>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className={`${headingClass} text-2xl sm:text-3xl`}>
              {docs.architectureTitle}
            </h2>
            <p className="max-w-[640px] text-muted-foreground">
              {docs.architectureSubtitle}
            </p>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            {/* The request path, top to bottom: each layer only talks to the
                one below it. */}
            <ol className="flex flex-col items-stretch">
              {layers.map((layer, index) => (
                <li key={layer.title} className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl border px-4 py-3",
                      toneAt(index).wash,
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl text-white",
                        toneAt(index).solid,
                      )}
                    >
                      <layer.icon className="size-4" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium">{layer.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {layer.detail}
                      </p>
                    </div>
                  </div>
                  <ArrowDownIcon
                    aria-hidden
                    className="my-1.5 size-4 text-muted-foreground"
                  />
                </li>
              ))}
              <li
                className={cn(
                  "rounded-2xl border px-4 py-3",
                  toneAt(layers.length).wash,
                )}
              >
                <p className="mb-2 font-medium">{docs.layers.services}</p>
                <div className="flex flex-wrap gap-1.5">
                  {services.map((service) => (
                    <Badge key={service} variant="outline" className="bg-background">
                      {service}
                    </Badge>
                  ))}
                </div>
              </li>
            </ol>

            <div className="grid gap-4 sm:grid-cols-2">
              {points.map((point, index) => (
                <div key={point.title} className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <point.icon
                      className={cn("size-4 shrink-0", toneAt(index).text)}
                    />
                    <h3 className="text-sm font-semibold">{point.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {point.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

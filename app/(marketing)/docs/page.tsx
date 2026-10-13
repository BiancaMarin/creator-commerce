import type { Metadata } from "next";
import type { ReactNode } from "react";

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

// Not copy: the author and the production address print the same in both
// languages, as on the PDF summary this page mirrors.
const author = "Marin Bianca Ioana";
const siteHost = "creator-commerce-bianca.vercel.app";

type Item = { readonly lead: string; readonly text: string };

/** A section heading with the brand-gradient tick in front of it. */
function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className={cn(headingClass, "flex items-center gap-2.5 text-xl sm:text-2xl")}>
      <span aria-hidden className="h-6 w-1.5 shrink-0 rounded-full bg-linear-to-b from-primary via-brand-indigo to-brand-violet" />
      {children}
    </h2>
  );
}

/** Bulleted items, each an optional bold lead followed by its text. */
function ItemList({ items, dark = false }: { items: readonly Item[]; dark?: boolean }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item.lead + item.text} className="flex gap-2.5 text-sm leading-relaxed">
          <span
            aria-hidden
            className={cn(
              "mt-[0.55em] size-1.5 shrink-0 rounded-full",
              dark ? "bg-brand-sky" : "bg-primary",
            )}
          />
          <span>
            {item.lead && <strong className="font-semibold">{item.lead}</strong>}
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default async function DocsPage() {
  const strings = await getStrings();
  const docs = strings.marketing.docs;
  const brand = strings.store.brand;

  // The dark panels (header, status), as on the PDF. The `dark` class scopes
  // the dark-theme tokens to the panel, so text and accents inside it stay
  // readable in either theme.
  const panelClass = "dark bg-background text-foreground ring-1 ring-foreground/10";

  return (
    <>
      <MarketingNav />

      <main className="mx-auto flex max-w-[1120px] flex-col gap-12 px-4 py-12 sm:px-8 sm:py-16">
        <header className={cn("relative overflow-hidden rounded-4xl", panelClass)}>
          <div
            aria-hidden
            className="absolute inset-y-0 right-0 hidden w-1/5 bg-linear-to-b from-primary via-brand-indigo to-brand-violet sm:block"
          />
          <div className="flex flex-col gap-4 px-6 py-10 sm:max-w-[78%] sm:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-sky">
              {docs.eyebrow}
            </p>
            <h1 className={cn(headingClass, "text-4xl sm:text-5xl")}>{brand}</h1>
            <p className="max-w-[640px] text-base text-foreground/85 sm:text-lg">
              {docs.subtitle}
            </p>
            <p className="text-sm text-muted-foreground">
              {author} · {docs.date} ·{" "}
              <a
                href={`https://${siteHost}`}
                className="font-semibold text-brand-sky hover:underline"
              >
                {siteHost}
              </a>
            </p>
          </div>
        </header>

        <section className="flex flex-col gap-5">
          <SectionTitle>{docs.flowTitle}</SectionTitle>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {docs.flow.map((step, index) => (
              <li key={step.title}>
                <Card size="sm" className={cn("h-full gap-1 px-5", toneAt(index).wash)}>
                  <span className={cn(headingClass, "text-2xl", toneAt(index).text)}>
                    {index + 1}
                  </span>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{step.body}</p>
                </Card>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-5">
          <SectionTitle>{docs.featuresTitle}</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            {docs.features.map((group, index) => (
              <Card key={group.title} size="sm" className="px-5">
                <h3 className={cn("font-semibold", toneAt(index).text)}>{group.title}</h3>
                <ItemList items={group.items} />
              </Card>
            ))}
          </div>
        </section>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          <section className="flex flex-col gap-5">
            <SectionTitle>{docs.techTitle}</SectionTitle>
            <table className="w-full text-sm">
              <tbody>
                {docs.tech.map((row) => (
                  <tr key={row.label} className="border-b">
                    <th scope="row" className="w-2/5 py-2.5 pr-4 text-left font-semibold">
                      {row.label}
                    </th>
                    <td className="py-2.5 text-muted-foreground">{row.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="flex flex-col gap-5">
            <SectionTitle>{docs.builtTitle}</SectionTitle>
            <ItemList items={docs.built} />
          </section>
        </div>

        <section className={cn("flex flex-col gap-5 rounded-4xl px-6 py-8 sm:px-8", panelClass)}>
          <SectionTitle>{docs.statusTitle}</SectionTitle>
          <div className="grid gap-2 md:grid-cols-2 md:gap-8">
            <ItemList items={docs.status} dark />
            <ItemList items={docs.next} dark />
          </div>
        </section>

        <footer className="flex flex-wrap justify-between gap-2 border-t pt-4 text-sm text-muted-foreground">
          <span>
            {brand} · {docs.footer}
          </span>
          <span>{siteHost}</span>
        </footer>
      </main>
    </>
  );
}

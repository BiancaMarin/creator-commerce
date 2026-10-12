import type { Metadata } from "next";
import { Geist, Geist_Mono, Public_Sans } from "next/font/google";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import "./globals.css";
import { uploadRouter } from "@/app/api/uploadthing/core";
import { PostHogProvider } from "@/components/analytics/posthog-provider";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { getDictionary } from "@/lib/i18n";
import { getLocale, getStrings } from "@/lib/server/i18n";
import { cn } from "@/lib/utils";

const publicSans = Public_Sans({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The fallback for any page without its own — in the reader's language.
export async function generateMetadata(): Promise<Metadata> {
  const strings = await getStrings();
  return {
    title: strings.store.brand,
    description: strings.marketing.hero.subtitle,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={cn(
        "h-full",
        "antialiased",
        geistSans.variable,
        geistMono.variable,
        "font-sans",
        publicSans.variable,
      )}
    >
      <body className="min-h-full flex flex-col">
        {/* Ships the file router's limits (accepted types, max size/count) with
            the initial HTML. Without it, an uploader has to fetch that config
            on mount and sits disabled for a beat. `extractRouterConfig` strips
            the middleware — only the public constraints cross to the client. */}
        <NextSSRPlugin routerConfig={extractRouterConfig(uploadRouter)} />
        {/* Boots PostHog for every route. It renders nothing and reads no
            session — see the component for why identity is attached by pages
            instead. */}
        <PostHogProvider>
          {/* Only the active language's dictionary crosses to the browser. */}
          <I18nProvider locale={locale} strings={getDictionary(locale)}>
            {children}
          </I18nProvider>
        </PostHogProvider>
      </body>
    </html>
  );
}

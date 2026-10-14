import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ProfilePhoto } from "@/components/profile-photo";
import { SiteNav } from "@/components/site-nav";
import { routing } from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export async function generateMetadata(
  props: PageProps<"/[locale]">
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: "Layout" });

  return {
    title: t("title"),
    description: t("description"),
    icons: {
      icon: "/profile.jpg",
      shortcut: "/profile.jpg",
      apple: "/profile.jpg",
    },
  };
}

export default async function LocaleLayout({
  children,
}: LayoutProps<"/[locale]">) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "Layout" });

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col"
      >
        <NextIntlClientProvider>
          <header className="sticky top-0 z-50 border-b border-black/[.06] bg-zinc-50/80 backdrop-blur-md dark:border-white/[.08] dark:bg-black/70">
            {/* Wraps on very narrow screens: the two path CTAs drop to a
                second row instead of squeezing the rest of the bar. */}
            <div className="mx-auto flex min-h-16 w-full max-w-4xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 sm:h-16 sm:flex-nowrap sm:px-6 sm:py-0">
              <Link
                href="/"
                className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
              >
                <ProfilePhoto alt={t("navPhotoAlt")} size="tiny" />
              </Link>
              <div className="ml-auto flex items-center gap-2 sm:gap-3">
                <SiteNav />
                <Suspense fallback={null}>
                  <LocaleSwitcher />
                </Suspense>
              </div>
            </div>
          </header>
          {children}
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}

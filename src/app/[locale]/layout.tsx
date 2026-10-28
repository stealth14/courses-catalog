import type { Metadata, Viewport } from "next";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { PostCacheProvider } from "@/components/post-cache-provider";
import { SiteNav } from "@/components/site-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import { routing } from "@/i18n/routing";
import "../globals.css";

/** Square cube mark extracted from the Custodio Seguro logo. */
const BRAND_MARK = "/brand/custodio-seguro-mark.png";
const BRAND_WORDMARK = "/brand/custodio_seguro_light_transparent.png";
const BRAND_WORDMARK_DARK = "/brand/custodio_seguro_dark_transparent.png";
const BRAND_WORDMARK_LIGHT_WIDTH = 1938;
const BRAND_WORDMARK_LIGHT_HEIGHT = 452;
const BRAND_WORDMARK_DARK_WIDTH = 1938;
const BRAND_WORDMARK_DARK_HEIGHT = 452;
const BRAND_OG_IMAGE = "/brand/og-image.png";

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
      icon: BRAND_MARK,
      shortcut: BRAND_MARK,
      apple: BRAND_MARK,
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
        {/* Parsed inline before any body content so the resolved theme paints
            on the first frame, without a light flash. */}
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <NextIntlClientProvider>
          <PostCacheProvider>
            <header className="sticky top-0 z-50 border-b border-black/[.06] bg-zinc-50/80 backdrop-blur-md dark:border-white/[.08] dark:bg-black/70">
              {/* Wraps on very narrow screens: the two path CTAs drop to a
                  second row instead of squeezing the rest of the bar. */}
              <div className="mx-auto flex min-h-16 w-full max-w-4xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2 sm:h-16 sm:flex-nowrap sm:px-6 sm:py-0">
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    href="/"
                    aria-label={t("navHomeLabel")}
                    className="flex items-center gap-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                  >
                    <Image
                      src={BRAND_WORDMARK}
                      alt=""
                      aria-hidden="true"
                      width={BRAND_WORDMARK_LIGHT_WIDTH}
                      height={BRAND_WORDMARK_LIGHT_HEIGHT}
                      loading="eager"
                      className="h-9 w-auto shrink-0 dark:hidden"
                    />
                    <Image
                      src={BRAND_WORDMARK_DARK}
                      alt=""
                      aria-hidden="true"
                      width={BRAND_WORDMARK_DARK_WIDTH}
                      height={BRAND_WORDMARK_DARK_HEIGHT}
                      loading="eager"
                      className="hidden h-9 w-auto shrink-0 dark:block"
                    />
                  </Link>
                </div>
                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                  <SiteNav
                    mobileMenuControls={
                      <div className="mt-2 flex items-center justify-end gap-2 border-t border-black/[.08] pt-2 dark:border-white/[.12]">
                        <Suspense fallback={null}>
                          <LocaleSwitcher />
                        </Suspense>
                        <ThemeToggle />
                      </div>
                    }
                  />
                  <div className="hidden items-center gap-2 sm:flex">
                    <Suspense fallback={null}>
                      <LocaleSwitcher />
                    </Suspense>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </header>
            {children}
          </PostCacheProvider>
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}

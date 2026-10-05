import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * Home page results section: money secured in Bitcoin through the
 * mentorship, with a link to `/transparency` where the on-chain balances
 * are charted per address. No wallet addresses are shown on the home page.
 */
export async function HomeMetrics() {
  const t = await getTranslations("HomePage");

  return (
    <>
      <section className="flex flex-col items-center gap-3 rounded-2xl border border-[#F7931A]/25 bg-gradient-to-b from-[#F7931A]/[.09] to-transparent px-6 py-6 text-center dark:border-[#F7931A]/20 dark:from-[#F7931A]/[.12]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F7931A]/30 bg-[#F7931A]/[.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A5B00] dark:border-[#F7931A]/25 dark:bg-[#F7931A]/[.12] dark:text-amber-400">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden="true"
            className="h-3.5 w-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 17.25 9 10.5l4.5 4.5 8.25-8.25"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 6.75h5.25v5.25"
            />
          </svg>
          {t("metricsLabel")}
        </span>
        <p className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {t("metricValue")}
        </p>
        <p className="max-w-xs text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("metricLabel")}
        </p>

        <Link
          href="/transparency"
          className="mt-1 inline-flex h-9 items-center gap-1.5 rounded-full border border-[#F7931A]/35 px-4 text-xs font-medium text-[#9A5B00] transition-colors hover:bg-[#F7931A]/10 dark:border-[#F7931A]/35 dark:text-amber-400 dark:hover:bg-[#F7931A]/15"
        >
          {t("exploreCta")}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
            className="h-3.5 w-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      </section>
    </>
  );
}

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * Home page results section: money secured in Bitcoin through the
 * mentorship, with a link to `/transparency` where the on-chain balances
 * are charted per address. No wallet addresses are shown on the home page.
 *
 * Set as a plain stat band — a hairline rule, the figure in tabular
 * numerals and an inline link — rather than a bordered card, so it reads
 * as a reported fact instead of another promo tile.
 */
export async function HomeMetrics() {
  const t = await getTranslations("HomePage");

  return (
    <section className="border-t border-black/[.08] pt-8 dark:border-white/[.145]">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A5B00] dark:text-amber-400">
            <span
              aria-hidden="true"
              className="h-px w-5 bg-current opacity-70"
            />
            {t("metricsLabel")}
          </span>

          <p className="text-4xl font-semibold tracking-tight text-black tabular-nums sm:text-5xl dark:text-zinc-50">
            {t("metricValue")}
          </p>

          <p className="max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {t("metricLabel")}
          </p>
        </div>

        <Link
          href="/transparency"
          className="group inline-flex shrink-0 items-center gap-1.5 self-start text-sm font-medium text-[#9A5B00] underline-offset-4 transition-colors hover:underline sm:self-auto dark:text-amber-400"
        >
          {t("exploreCta")}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}

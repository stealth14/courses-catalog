import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * Home page trust sections: the business metrics/results block (money
 * secured in Bitcoin through the mentorship) and the verification teaser
 * that links to `/verification`, where the on-chain balances are charted
 * per address. No wallet addresses are shown on the home page itself.
 */
export async function HomeMetrics() {
  const t = await getTranslations("HomePage");

  return (
    <>
      <section className="flex flex-col gap-2 rounded-2xl border border-[#F7931A]/25 bg-[#F7931A]/[.07] p-5 dark:border-[#F7931A]/20 dark:bg-[#F7931A]/[.09]">
        <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
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
        </p>
        <p className="text-4xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {t("metricValue")}
        </p>
        <p className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
          {t("metricLabel")}
        </p>
        <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          {t("metricsNote")}
        </p>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-black/[.08] p-5 dark:border-white/[.145]">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-black dark:text-zinc-50">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-4 w-4 shrink-0 fill-emerald-600 dark:fill-emerald-400"
          >
            <path
              fillRule="evenodd"
              d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
              clipRule="evenodd"
            />
          </svg>
          {t("verifyTitle")}
        </h2>

        <Link
          href="/verification"
          className="flex h-11 w-full items-center justify-center rounded-full border border-black/[.08] text-xs font-medium text-zinc-700 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-200 dark:hover:bg-white/[.06]"
        >
          {t("verifyCta")}
        </Link>

        <p className="text-[11px] leading-5 text-zinc-400 dark:text-zinc-500">
          {t("verifyNote")}
        </p>
      </section>
    </>
  );
}

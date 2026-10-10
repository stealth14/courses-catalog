import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowIcon } from "@/components/arrow-icon";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("FreePage");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

/**
 * Entrance to the free material. The guides themselves live under `/wiki`;
 * this page is the shelf, so a second guide only costs a card here plus
 * its own nested route. Rendered as a scrolling document on the same
 * `max-w-4xl` column as the landing page.
 */
export default async function FreePage() {
  const t = await getTranslations("FreePage");

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 pt-10 pb-10 sm:gap-16 sm:px-6 sm:pt-16 sm:pb-16">
        <header className="flex flex-col items-center gap-4 text-center">
          <h1 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-zinc-50">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
            {t("subtitle")}
          </p>
        </header>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
              {t("knowledgeTitle")}
            </h2>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {t("knowledgeSubtitle")}
            </p>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            <li className="flex">
              <Link
                href="/wiki"
                className="group flex flex-1 flex-col gap-3 rounded-2xl border border-black/[.08] p-4 transition-colors hover:border-black/[.16] hover:bg-black/[.02] dark:border-white/[.145] dark:hover:border-white/[.25] dark:hover:bg-white/[.04]"
              >
                <span className="self-start rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
                  {t("entries.walletArchitecture.tag")}
                </span>
                <h3 className="text-sm font-semibold tracking-tight text-black dark:text-zinc-50">
                  {t("entries.walletArchitecture.title")}
                </h3>
                <p className="flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {t("entries.walletArchitecture.body")}
                </p>
                <span className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-[#9A5B00] dark:text-amber-400">
                  {t("entries.walletArchitecture.cta")}
                  <ArrowIcon />
                </span>
              </Link>
            </li>
          </ul>
        </section>

        <section className="flex flex-col items-center gap-3 rounded-2xl border border-black/[.08] p-6 text-center dark:border-white/[.145]">
          <h2 className="text-lg font-semibold tracking-tight text-black dark:text-zinc-50">
            {t("expertTitle")}
          </h2>
          <p className="max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {t("expertBody")}
          </p>
          <Link
            href="/premium"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#9A5B00] underline-offset-4 transition-colors hover:underline dark:text-amber-400"
          >
            {t("expertCta")}
            <ArrowIcon />
          </Link>
        </section>
      </div>
    </main>
  );
}

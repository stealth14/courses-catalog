import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowIcon } from "@/components/arrow-icon";
import { Link } from "@/i18n/navigation";
import { HomeOffering } from "../../home-offering";
import { HomeWhatsappCta } from "../../home-whatsapp-cta";

/** Translation key suffixes under `PremiumPage.benefits`. */
const BENEFITS = ["setup", "keys", "verify", "support"] as const;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PremiumPage");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

/**
 * Paid track: what the sessions cover, then `HomeOffering`, which reads
 * prices from the catalog client-side so "a convenient price" shows the
 * real price instead of a number frozen into the build.
 */
export default async function PremiumPage() {
  const t = await getTranslations("PremiumPage");

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
          <HomeWhatsappCta placement="profile" />
        </header>

        <section className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
            {t("benefitsTitle")}
          </h2>

          <ul className="grid gap-4 sm:grid-cols-2">
            {BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="flex flex-col gap-2 rounded-2xl border border-black/[.08] p-4 dark:border-white/[.145]"
              >
                <h3 className="text-sm font-semibold tracking-tight text-black dark:text-zinc-50">
                  {t(`benefits.${benefit}.title`)}
                </h3>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {t(`benefits.${benefit}.body`)}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <HomeOffering />

        <section className="flex flex-col items-center gap-3 rounded-2xl border border-black/[.08] p-6 text-center dark:border-white/[.145]">
          <h2 className="text-lg font-semibold tracking-tight text-black dark:text-zinc-50">
            {t("architecturesTitle")}
          </h2>
          <p className="max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {t("architecturesBody")}
          </p>
          <Link
            href="/academy/knowledge"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-[#9A5B00] underline-offset-4 transition-colors hover:underline dark:text-amber-400"
          >
            {t("architecturesCta")}
            <ArrowIcon />
          </Link>
        </section>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PaymentHeader } from "./payment/payment-header";
import { HomeHero } from "./home-hero";
import { HomeMetrics } from "./home-metrics";
import { HomeWhatsappCta } from "./home-whatsapp-cta";
import { WalletRiskScale } from "./academy/knowledge/wallet-risk-scale";
import { ArrowIcon } from "@/components/arrow-icon";
import { Link } from "@/i18n/navigation";
import { WalletScandalsRow } from "@/components/wallet-scandals-row";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("HomePage");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

/**
 * Landing page.
 *
 * Deliberately does not use `StepCard`: that shell pins its card to the
 * viewport height for the fixed-size checkout flow, while this page is a
 * scrolling document. The hero owns the page's only `<h1>`, so
 * `PaymentHeader` is rendered without heading elements.
 */
export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <main className="flex flex-1 flex-col gap-10 bg-zinc-50 sm:gap-8 dark:bg-black">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pt-12 pb-6 sm:px-6 sm:pt-20 sm:pb-10 lg:pt-24">
        <HomeHero />
      </div>

      <WalletScandalsRow />

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-3 px-4 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight text-primary">
          <Link
            href="/academy/por-que-fallan-las-billeteras"
            className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
          >
            {t("learningSection.title")}
          </Link>
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-10">
          <p className="max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {t("learningSection.body")}
          </p>
          <Link
            href="/academy/por-que-fallan-las-billeteras"
            className="group inline-flex shrink-0 items-center gap-1.5 self-start text-sm font-medium text-primary-deep underline-offset-4 transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:self-auto dark:text-primary-soft"
          >
            {t("learningSection.learnMore")}
            <ArrowIcon />
          </Link>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-12 px-4 pb-10 sm:gap-16 sm:px-6 sm:pb-16">
        <WalletRiskScale />
        <HomeMetrics />

        <section className="flex flex-col items-center gap-5">
          <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
            {t("who.title")}
          </h2>
          <PaymentHeader variant="full" headingLevel="none" />
          <HomeWhatsappCta placement="profile" />
        </section>
      </div>
    </main>
  );
}

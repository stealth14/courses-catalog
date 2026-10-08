import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PaymentHeader } from "./payment/payment-header";
import { HomeHero } from "./home-hero";
import { HomeMetrics } from "./home-metrics";
import { HomeWalletScandals } from "./home-wallet-scandals";
import { HomeWalletRiskScale } from "./home-wallet-risk-scale";
import { HomeHowItWorks } from "./home-how-it-works";
import { HomeOffering } from "./home-offering";
import { HomeFaq } from "./home-faq";
import { HomeFinalCta } from "./home-final-cta";

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
    <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-16 px-4 pt-10 sm:gap-20 sm:px-6 sm:pt-16">
        <HomeHero />
      </div>

      <HomeWalletScandals />

      <section className="mx-auto my-16 flex w-full max-w-4xl flex-col gap-3 px-4 sm:my-20 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight text-[#9A5B00] dark:text-amber-400">
          {t("learningSection.title")}
        </h2>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("learningSection.body")}
        </p>
      </section>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-16 px-4 pb-10 sm:gap-20 sm:px-6 sm:pb-16">
        <HomeMetrics />

        <HomeWalletRiskScale />

        <HomeHowItWorks />

        <HomeOffering />

        <section className="flex flex-col items-center gap-5">
          <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
            {t("who.title")}
          </h2>
          <PaymentHeader variant="full" headingLevel="none" />
        </section>

        <HomeFaq />

        <HomeFinalCta />
      </div>
    </main>
  );
}

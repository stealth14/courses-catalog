import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PaymentHeader } from "./payment/payment-header";
import { HomeHero } from "./home-hero";
import { HomeMetrics } from "./home-metrics";
import { HomeWalletScandals } from "./home-wallet-scandals";
import { HomeHowItWorks } from "./home-how-it-works";
import { HomeOffering } from "./home-offering";
import { HomeVerification } from "./home-verification";
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

        <HomeMetrics />
      </div>

      <HomeWalletScandals />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-16 px-4 pb-10 sm:gap-20 sm:px-6 sm:pb-16">
        <HomeHowItWorks />

        <HomeOffering />

        <section className="flex flex-col items-center gap-5">
          <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
            {t("who.title")}
          </h2>
          <PaymentHeader variant="full" headingLevel="none" />
        </section>

        <HomeVerification />

        <HomeFaq />

        <HomeFinalCta />
      </div>
    </main>
  );
}


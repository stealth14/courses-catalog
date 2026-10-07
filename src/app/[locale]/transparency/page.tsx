import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSecuredWallets } from "@/lib/secured-wallets";
import { WalletPieChart } from "./wallet-pie-chart";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("TransparencyPage");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

/**
 * On-chain proof page: pie chart of the BTC wallets the mentorship helped
 * secure. Data comes from `public/secured-wallets.json` until the backend
 * endpoint replaces `getSecuredWallets()`.
 *
 * Rendered like the landing page — a scrolling document on the wide
 * `max-w-4xl` column, not the fixed `StepCard` of the checkout flow — so
 * the chart and the wallet rows get the room they need. The sticky layout
 * header already carries the profile photo, so this page adds none.
 */
export default async function TransparencyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations("TransparencyPage");
  const { wallets, explorer, btcPriceUsd } = await getSecuredWallets();

  const { wallet: walletParam } = await searchParams;
  const initialAddress = Array.isArray(walletParam)
    ? walletParam[0]
    : walletParam;

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

        <WalletPieChart
          wallets={wallets}
          explorer={explorer}
          btcPriceUsd={btcPriceUsd}
          initialAddress={initialAddress}
        />
      </div>
    </main>
  );
}

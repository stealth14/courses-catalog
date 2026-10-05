import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StepCard } from "@/components/step-card";
import { getSecuredWallets } from "@/lib/secured-wallets";
import { PaymentHeader } from "../payment/payment-header";
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
 */
export default async function TransparencyPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const t = await getTranslations("TransparencyPage");
  const { wallets, explorer, btcPriceUsd, sample } = await getSecuredWallets();

  const { wallet: walletParam } = await searchParams;
  const initialAddress = Array.isArray(walletParam)
    ? walletParam[0]
    : walletParam;

  return (
    <StepCard>
      <PaymentHeader variant="compact" />

      <div className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold tracking-tight text-black dark:text-zinc-50">
          {t("title")}
        </h1>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("subtitle")}
        </p>
      </div>

      {sample ? (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {t("sampleNotice")}
        </p>
      ) : null}

      <WalletPieChart
        wallets={wallets}
        explorer={explorer}
        btcPriceUsd={btcPriceUsd}
        initialAddress={initialAddress}
      />
    </StepCard>
  );
}

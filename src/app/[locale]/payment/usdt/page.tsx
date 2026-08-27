import type { Metadata } from "next";
import QRCode from "qrcode";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { getPaymentAddresses } from "@/lib/payment-addresses";
import { PaymentHeader } from "../payment-header";
import { WalletTabs, type NetworkWallet } from "../wallet-tabs";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PaymentPage");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

async function buildWallet(
  id: NetworkWallet["id"],
  label: string,
  address: string,
  steps: ReactNode[]
): Promise<NetworkWallet> {
  const qr = await QRCode.toDataURL(address, {
    width: 240,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  });

  return { id, label, address, qr, steps };
}

export default async function UsdtPaymentPage() {
  const t = await getTranslations("PaymentPage");
  const { usdt } = await getPaymentAddresses();

  const highlight = (chunks: ReactNode) => (
    <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
      {chunks}
    </strong>
  );

  const erc20Steps = [
    t.rich("stepErc201", { b: highlight }),
    t.rich("stepErc202", { b: highlight }),
    t.rich("stepErc203", { b: highlight }),
  ];
  const bscSteps = [
    t.rich("stepBsc1", { b: highlight }),
    t.rich("stepBsc2", { b: highlight }),
    t.rich("stepBsc3", { b: highlight }),
  ];

  const wallets = await Promise.all([
    buildWallet("erc20", t("walletErc20"), usdt.erc20, erc20Steps),
    buildWallet("bsc", t("walletBsc"), usdt.bsc, bscSteps),
  ]);

  return (
    <>
      <div className="hidden sm:block">
        <PaymentHeader variant="compact" />
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("subtitle")}
        </p>
        <WalletTabs wallets={wallets} stepsTitle={t("stepsTitle")} />
      </div>

      <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
        {t("warning")}
      </p>
    </>
  );
}

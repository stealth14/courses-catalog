import type { Metadata } from "next";
import QRCode from "qrcode";
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
  address: string
): Promise<NetworkWallet> {
  const qr = await QRCode.toDataURL(address, {
    width: 240,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  });

  return { id, label, address, qr };
}

export default async function UsdtPaymentPage() {
  const t = await getTranslations("PaymentPage");
  const { usdt } = await getPaymentAddresses();

  const wallets = await Promise.all([
    buildWallet("erc20", t("walletErc20"), usdt.erc20),
    buildWallet("bsc", t("walletBsc"), usdt.bsc),
  ]);

  return (
    <>
      <PaymentHeader variant="compact" />

      <div className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("subtitle")}
        </p>
        <WalletTabs wallets={wallets} />
      </div>

      <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
        {t("warning")}
      </p>
    </>
  );
}

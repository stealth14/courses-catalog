import type { Metadata } from "next";
import QRCode from "qrcode";
import { getTranslations } from "next-intl/server";
import { PaymentHeader } from "../payment-header";
import { PaymentMethodNav } from "../payment-method-nav";
import { WalletTabs, type NetworkWallet } from "../wallet-tabs";

// Public USDT wallet addresses used to collect payments.
// Override with NEXT_PUBLIC_USDT_ERC20 / NEXT_PUBLIC_USDT_BSC in .env.local.
const USDT_ERC20 =
  process.env.NEXT_PUBLIC_USDT_ERC20 ??
  "0x15afF0830f275c9691a73B2DFCB001cc33f9AB5E";
const USDT_BSC =
  process.env.NEXT_PUBLIC_USDT_BSC ??
  "0x15afF0830f275c9691a73B2DFCB001cc33f9AB5E";

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

  const wallets = await Promise.all([
    buildWallet("erc20", t("walletErc20"), USDT_ERC20),
    buildWallet("bsc", t("walletBsc"), USDT_BSC),
  ]);

  return (
    <>
      <PaymentHeader variant="compact" />
      <PaymentMethodNav />

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

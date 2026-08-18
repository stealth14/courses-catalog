import type { Metadata } from "next";
import QRCode from "qrcode";
import { getTranslations } from "next-intl/server";
import { PaymentHeader } from "../payment-header";
import { WalletDisplay } from "../wallet-display";

// Public BTC wallet address used to collect payments.
// Override with NEXT_PUBLIC_BTC_WALLET in .env.local.
const BTC_WALLET =
  process.env.NEXT_PUBLIC_BTC_WALLET ?? "SET_YOUR_BTC_WALLET_IN_ENV_LOCAL";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("BtcPage");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

export default async function BtcPaymentPage() {
  const t = await getTranslations("BtcPage");

  const qr = await QRCode.toDataURL(BTC_WALLET, {
    width: 240,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  });

  return (
    <>
      <PaymentHeader variant="compact" />

      <div className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("subtitle")}
        </p>
        <WalletDisplay
          label={t("walletLabel")}
          address={BTC_WALLET}
          qr={qr}
          qrAlt={t("qrAlt")}
        />
      </div>

      <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
        {t("warning")}
      </p>
    </>
  );
}

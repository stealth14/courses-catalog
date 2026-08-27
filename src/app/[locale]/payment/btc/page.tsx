import type { Metadata } from "next";
import QRCode from "qrcode";
import { getTranslations } from "next-intl/server";
import { getPaymentAddresses } from "@/lib/payment-addresses";
import { PaymentHeader } from "../payment-header";
import { WalletDisplay } from "../wallet-display";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("BtcPage");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

export default async function BtcPaymentPage() {
  const t = await getTranslations("BtcPage");
  const { btc } = await getPaymentAddresses();

  const qr = await QRCode.toDataURL(btc.mainnet, {
    width: 240,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  }); 

  return (
    <>
      <div className="hidden sm:block">
        <PaymentHeader variant="compact" />
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("subtitle")}
        </p>
        <WalletDisplay
          label={t("walletLabel")}
          address={btc.mainnet}
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

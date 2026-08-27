import type { Metadata } from "next";
import QRCode from "qrcode";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { getPaymentAddresses } from "@/lib/payment-addresses";
import { PaymentHeader } from "../payment-header";
import { PaymentSteps } from "../payment-steps";
import { WalletDisplay } from "../wallet-display";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("BinancePage");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

export default async function BinancePaymentPage() {
  const t = await getTranslations("BinancePage");
  const { binance } = await getPaymentAddresses();

  const highlight = (chunks: ReactNode) => (
    <strong className="font-semibold text-zinc-900 dark:text-zinc-100">
      {chunks}
    </strong>
  );

  const steps = [
    t.rich("step1", { b: highlight }),
    t.rich("step2", { b: highlight }),
    t.rich("step3", { b: highlight }),
  ];

  const qr = await QRCode.toDataURL(binance.email, {
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
          label={t("emailLabel")}
          address={binance.email}
          qr={qr}
          qrAlt={t("qrAlt")}
        />
        <PaymentSteps stepsTitle={t("stepsTitle")} steps={steps} />
      </div>

      <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
        {t("warning")}
      </p>
    </>
  );
}

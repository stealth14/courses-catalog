import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { WalletScandalsRow } from "@/components/wallet-scandals-row";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("WalletScams");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

export default function WalletScamsPage() {
  return <WalletScandalsRow />;
}

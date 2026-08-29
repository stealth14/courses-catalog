import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { StepCard } from "@/components/step-card";
import { PaymentHeader } from "../payment/payment-header";
import { ShopProducts } from "./shop-products";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Shop");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

/**
 * Shop page shell.
 *
 * The product catalog itself is rendered by the client `ShopProducts`
 * component, which fetches the products from Strapi through the
 * `useProducts` hook and localizes them per the active locale.
 */
export default async function ShopPage() {
  return (
    <StepCard>
      <PaymentHeader variant="compact" />
      <ShopProducts />
    </StepCard>
  );
}

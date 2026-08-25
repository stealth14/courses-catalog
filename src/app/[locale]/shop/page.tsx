import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Shop } from "@/components/shop";
import { getProducts } from "@/lib/products";
import { PaymentHeader } from "../payment/payment-header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Shop");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 pt-1 pb-12 font-sans dark:bg-black sm:px-6 sm:py-24">
      <div className="mt-2 flex w-full max-w-md flex-col gap-6 sm:mt-6 sm:rounded-2xl sm:border sm:border-black/[.08] sm:bg-white sm:p-8 sm:dark:border-white/[.145] sm:dark:bg-[#111]">
        <PaymentHeader variant="compact" />

        <Shop products={products} />
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Product } from "@/models/product";
import { PaymentHeader } from "../payment/payment-header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Shop");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

export default async function ShopPage() {
  const locale = await getLocale();
  const t = await getTranslations("Shop");

  const products = (await Product.getProducts()).map((product) =>
    Product.localize(product, locale)
  );

  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
  });

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-4 pt-1 pb-12 font-sans dark:bg-black sm:px-6 sm:py-24">
      <div className="mt-2 flex w-full max-w-md flex-col gap-6 sm:mt-6 sm:rounded-2xl sm:border sm:border-black/[.08] sm:bg-white sm:p-8 sm:dark:border-white/[.145] sm:dark:bg-[#111]">
        <PaymentHeader variant="compact" />

        <div className="flex flex-col gap-4">
          {products.map((product) => (
            <article
              key={product.id}
              className="flex flex-col gap-3 rounded-2xl border border-black/[.08] p-4 dark:border-white/[.145]"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="min-w-0 text-base font-semibold tracking-tight text-black dark:text-zinc-50">
                  {product.title}
                </h2>
                <span className="shrink-0 text-lg font-semibold text-black dark:text-zinc-50">
                  {currency.format(product.price)}
                </span>
              </div>
              <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {product.description}
              </p>
              <Link
                href={`/payment/methods?product=${product.slug}`}
                className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
              >
                {t("buy")}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { StepCard } from "@/components/step-card";
import { Product, ProductVariant } from "@/models/product";
import { PaymentHeader } from "../payment/payment-header";

/** Special color per variant value, used to theme its chip. */
const VARIANT_CHIP_CLASSES: Record<ProductVariant, string> = {
  [ProductVariant.SINGLE]:
    "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  [ProductVariant.SUBSCRIPTION]:
    "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  [ProductVariant.MENTORSHIP]:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
};

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

  const variantLabels: Record<ProductVariant, string> = {
    [ProductVariant.SINGLE]: t("variantSingle"),
    [ProductVariant.SUBSCRIPTION]: t("variantSubscription"),
    [ProductVariant.MENTORSHIP]: t("variantMentorship"),
  };

  return (
    <StepCard>
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
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${VARIANT_CHIP_CLASSES[product.variant]}`}
                >
                  {variantLabels[product.variant]}
                </span>
                {product.duration !== null ? (
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:bg-white/[.08] dark:text-zinc-300">
                    {t("durationMonths", { months: product.duration })}
                  </span>
                ) : null}
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
    </StepCard>
  );
}

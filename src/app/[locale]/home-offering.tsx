"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Product, ProductVariant } from "@/models/product";
import useProducts from "@/hooks/products";

/** Variant chip tones, mirroring the ones used on `/shop`. */
const VARIANT_CHIP_CLASSES: Record<ProductVariant, string> = {
  [ProductVariant.SINGLE]:
    "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  [ProductVariant.SUBSCRIPTION]:
    "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  [ProductVariant.MENTORSHIP]:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
};

/**
 * Plans section. Reads the catalog client-side through `useProducts`, the
 * same way `/shop` does, so prices stay live instead of being frozen into
 * the statically prerendered landing page.
 *
 * A failed fetch and an empty catalog both fall back to a plain link to
 * `/shop`: the landing page should never show a raw request error where
 * it is trying to sell.
 */
export function HomeOffering() {
  const t = useTranslations("HomePage");
  const ts = useTranslations("Shop");
  const locale = useLocale();
  const result = useProducts();

  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
  });

  const variantLabels: Record<ProductVariant, string> = {
    [ProductVariant.SINGLE]: ts("variantSingle"),
    [ProductVariant.SUBSCRIPTION]: ts("variantSubscription"),
    [ProductVariant.MENTORSHIP]: ts("variantMentorship"),
  };

  const heading = (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {t("offering.title")}
      </h2>
      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {t("offering.subtitle")}
      </p>
    </div>
  );

  const fallbackCta = (
    <Link
      href="/shop"
      className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
    >
      {t("offering.fallbackCta")}
    </Link>
  );

  if (result.status === "loading" || result.status === "idle") {
    return (
      <section className="flex flex-col gap-6">
        {heading}
        <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          {ts("loading")}
        </p>
      </section>
    );
  }

  if (result.status !== "success" || result.items.length === 0) {
    return (
      <section className="flex flex-col gap-6">
        {heading}
        {fallbackCta}
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      {heading}

      <ul className="grid gap-4 sm:grid-cols-3">
        {result.items.map((product) => {
          const localized = Product.localize(product, locale);

          return (
            <li
              key={product.id}
              className="flex flex-col gap-3 rounded-2xl border border-black/[.08] p-4 dark:border-white/[.145]"
            >
              <span
                className={`self-start rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${VARIANT_CHIP_CLASSES[localized.variant]}`}
              >
                {variantLabels[localized.variant]}
              </span>
              <h3 className="text-sm font-semibold tracking-tight text-black dark:text-zinc-50">
                {localized.title}
              </h3>
              <p className="flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                {localized.description}
              </p>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-base font-semibold text-black dark:text-zinc-50">
                  {currency.format(localized.price)}
                </span>
                {localized.duration !== null ? (
                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {ts("durationMonths", { months: localized.duration })}
                  </span>
                ) : null}
              </div>
              <Link
                href={`/appointment?product=${localized.slug}`}
                className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
              >
                {ts("learnMore")}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

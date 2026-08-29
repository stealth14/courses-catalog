"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { RequestError } from "@/components/request-error";
import { Product, ProductVariant } from "@/models/product";
import useProducts from "@/hooks/products";

/** Special color per variant value, used to theme its chip. */
const VARIANT_CHIP_CLASSES: Record<ProductVariant, string> = {
  [ProductVariant.SINGLE]:
    "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  [ProductVariant.SUBSCRIPTION]:
    "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  [ProductVariant.MENTORSHIP]:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
};

/**
 * Client component that populates the shop with the product catalog
 * fetched from Strapi through the `useProducts` hook (see
 * `src/hooks/posts.example.ts` for the pattern it follows).
 *
 * Renders per the hook's status:
 *   - "idle"/"loading" → localized loading text
 *   - "error"          → RequestError panel with the request details
 *   - empty catalog    → localized empty text
 *   - "success"        → one card per product
 */
export function ShopProducts() {
  const locale = useLocale();
  const t = useTranslations("Shop");
  const result = useProducts();

  const variantLabels: Record<ProductVariant, string> = {
    [ProductVariant.SINGLE]: t("variantSingle"),
    [ProductVariant.SUBSCRIPTION]: t("variantSubscription"),
    [ProductVariant.MENTORSHIP]: t("variantMentorship"),
  };

  if (result.status === "loading" || result.status === "idle") {
    return (
      <p className="py-8 text-center text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {t("loading")}
      </p>
    );
  }

  if (result.status === "error") {
    return (
      <RequestError
        error={result.error}
        title={t("error")}
        retryLabel={t("retry")}
        onRetry={result.refresh}
      />
    );
  }

  // Not "success" (the collection hook never emits "refreshing").
  if (result.status !== "success" || result.items.length === 0) {
    return (
      <p className="py-8 text-center text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {t("empty")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {result.items.map((product) => {
        const localized = Product.localize(product, locale);

        return (
          <article
            key={product.id}
            className="flex flex-col gap-3 rounded-2xl border border-black/[.08] p-4 dark:border-white/[.145]"
          >
            <h2 className="min-w-0 text-base font-semibold tracking-tight text-black dark:text-zinc-50">
              {localized.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${VARIANT_CHIP_CLASSES[localized.variant]}`}
              >
                {variantLabels[localized.variant]}
              </span>
              {localized.duration !== null ? (
                <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-600 dark:bg-white/[.08] dark:text-zinc-300">
                  {t("durationMonths", { months: localized.duration })}
                </span>
              ) : null}
            </div>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {localized.description}
            </p>
            <Link
              href={`/appointment?product=${localized.slug}`}
              className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
            >
              {t("learnMore")}
            </Link>
          </article>
        );
      })}
    </div>
  );
}

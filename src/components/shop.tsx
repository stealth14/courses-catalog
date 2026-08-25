"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Product } from "@/lib/products";

type CartItem = {
  product: Product;
  quantity: number;
};

export function Shop({ products }: { products: Product[] }) {
  const t = useTranslations("Shop");
  const locale = useLocale();
  const [items, setItems] = useState<CartItem[]>([]);

  const currency = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
  });

  function add(product: Product) {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }

  function remove(productId: number) {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
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
          <button
            type="button"
            onClick={() => add(product)}
            className="self-start rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
          >
            {t("addToCart")}
          </button>
        </article>
      ))}

      <aside className="flex flex-col gap-4 rounded-2xl border border-black/[.08] p-4 dark:border-white/[.145]">
        <h2 className="text-base font-semibold tracking-tight text-black dark:text-zinc-50">
          {t("cartTitle")}
        </h2>

        {items.length === 0 ? (
          <p className="text-sm leading-6 text-zinc-500 dark:text-zinc-400">
            {t("cartEmpty")}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map(({ product, quantity }) => (
              <li
                key={product.id}
                className="flex items-start justify-between gap-3 border-b border-black/[.06] pb-3 last:border-b-0 last:pb-0 dark:border-white/[.08]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-black dark:text-zinc-50">
                    {product.title}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {currency.format(product.price)} × {quantity}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  className="shrink-0 text-xs font-medium text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
                >
                  {t("remove")}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex items-center justify-between border-t border-black/[.08] pt-4 dark:border-white/[.145]">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            {t("total")}
          </span>
          <span className="text-lg font-semibold text-black dark:text-zinc-50">
            {currency.format(total)}
          </span>
        </div>
      </aside>
    </div>
  );
}

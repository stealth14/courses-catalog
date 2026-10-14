"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

/** Only what the picker renders — the brand module itself is server-only. */
export type Brand = {
  id: string;
  name: string;
  monogram: string;
};

/** Chip geometry only; the variants below own every color. */
const ITEM_BASE =
  "flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A5B00] dark:focus-visible:outline-amber-400";

const ITEM_CLASSES = {
  idle: "text-zinc-600 hover:bg-black/[.04] dark:text-zinc-300 dark:hover:bg-white/[.06]",
  active: "bg-foreground text-background",
};

const MONOGRAM_BASE =
  "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[10px] font-bold tracking-wide";

const MONOGRAM_CLASSES = {
  idle: "bg-zinc-100 text-zinc-600 ring-1 ring-black/[.06] dark:bg-white/[.08] dark:text-zinc-200 dark:ring-white/[.08]",
  active: "bg-background/25 text-background",
};

/**
 * Brand picker for the knowledge base. Stays a client component so it can
 * mark the entry being read with `aria-current`; the brand list itself is
 * passed in from the server layout.
 *
 * Laid out as wrapping chips on phones and as a sticky column from `lg`.
 */
export function BrandList({ brands }: { brands: Brand[] }) {
  const t = useTranslations("WalletKnowledge");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("brandsTitle")}
      className="lg:sticky lg:top-24 lg:w-56 lg:shrink-0"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9A5B00] dark:text-amber-400">
        {t("brandsTitle")}
      </p>

      <ul className="mt-3 flex flex-wrap gap-1.5 lg:flex-col lg:gap-0.5">
        {brands.map((brand) => {
          const href = `/academy/knowledge/${brand.id}`;
          const active = pathname === href;
          const variant = active ? "active" : "idle";

          return (
            <li key={brand.id} className="lg:w-full">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`${ITEM_BASE} ${ITEM_CLASSES[variant]}`}
              >
                <span
                  aria-hidden="true"
                  className={`${MONOGRAM_BASE} ${MONOGRAM_CLASSES[variant]}`}
                >
                  {brand.monogram}
                </span>
                {brand.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

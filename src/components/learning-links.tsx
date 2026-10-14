"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

/** Free learning path shown in the hero and the navigation bar. */
const NAV_ITEMS = [
  { href: "/academy/free", label: "free", tone: "quiet" },
] as const;

/**
 * Chip geometry only — every color decision lives in `CHIP_CLASSES`, so
 * an active chip can swap a tone without two conflicting utilities
 * ending up in the same class list.
 */
const CHIP_CLASSES: Record<
  (typeof NAV_ITEMS)[number]["tone"],
  { idle: string; active: string }
> = {
  quiet: {
    idle: "border border-black/[.12] text-zinc-700 hover:bg-black/[.04] active:bg-black/[.08] dark:border-white/[.145] dark:text-zinc-200 dark:hover:bg-white/[.06] dark:active:bg-white/[.1]",
    active:
      "border border-transparent bg-black/[.06] text-black active:bg-black/[.1] dark:bg-white/[.12] dark:text-white dark:active:bg-white/[.18]",
  },
};

const CHIP_SIZES = {
  nav: "h-8 px-2.5 text-xs",
  hero: "h-12 w-full justify-center px-5 text-sm sm:w-auto",
} as const;

export function LearningLinks({
  size,
  className = "",
}: {
  size: keyof typeof CHIP_SIZES;
  className?: string;
}) {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  return (
    <div
      className={`flex items-center gap-2 ${
        size === "hero"
          ? "w-full max-w-xs flex-col sm:w-auto sm:max-w-none sm:flex-row"
          : ""
      } ${className}`}
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center rounded-full font-semibold whitespace-nowrap select-none transition active:scale-95 [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A5B00] dark:focus-visible:outline-amber-400 ${CHIP_SIZES[size]} ${
              CHIP_CLASSES[item.tone][active ? "active" : "idle"]
            }`}
          >
            {t(item.label)}
          </Link>
        );
      })}
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

/** The two paths through the site: the free material and the paid track. */
const NAV_ITEMS = [
  { href: "/free", label: "free", short: "freeShort", tone: "quiet" },
  { href: "/premium", label: "premium", short: "premiumShort", tone: "loud" },
] as const;

/**
 * Chip geometry only — every color decision lives in `CHIP_CLASSES`, so
 * an active chip can swap a tone without two conflicting utilities
 * (bg-foreground versus bg-[#9A5B00]) ending up in the same class list.
 */
const CHIP_BASE =
  "inline-flex h-8 items-center rounded-full px-2.5 text-xs font-semibold whitespace-nowrap select-none transition active:scale-95 [-webkit-tap-highlight-color:transparent] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A5B00] dark:focus-visible:outline-amber-400";

const CHIP_CLASSES: Record<
  (typeof NAV_ITEMS)[number]["tone"],
  { idle: string; active: string }
> = {
  quiet: {
    idle: "border border-black/[.12] text-zinc-700 hover:bg-black/[.04] active:bg-black/[.08] dark:border-white/[.145] dark:text-zinc-200 dark:hover:bg-white/[.06] dark:active:bg-white/[.1]",
    active:
      "border border-transparent bg-black/[.06] text-black active:bg-black/[.1] dark:bg-white/[.12] dark:text-white dark:active:bg-white/[.18]",
  },
  loud: {
    idle: "border border-transparent bg-foreground text-background hover:bg-[#383838] active:bg-[#252525] dark:hover:bg-[#ccc] dark:active:bg-[#b8b8b8]",
    active:
      "border border-transparent bg-[#9A5B00] text-white active:bg-[#7a4800] dark:bg-amber-400 dark:text-black dark:active:bg-amber-500",
  },
};

/**
 * Header calls to action. Labels fall back to a short form below `sm`,
 * where the bar shares its width with the profile photo, the back button
 * and the locale switcher.
 */
export function SiteNav() {
  const t = useTranslations("Nav");
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="flex items-center gap-1.5">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`${CHIP_BASE} ${
              CHIP_CLASSES[item.tone][active ? "active" : "idle"]
            }`}
          >
            <span className="hidden sm:inline">{t(item.label)}</span>
            <span className="sm:hidden">{t(item.short)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

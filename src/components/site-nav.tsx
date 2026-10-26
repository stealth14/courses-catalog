"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

// Temporarily hidden: "/academy" will be re-enabled later.
const NAV_ITEMS = [
  { href: "/", label: "home", icon: "home" },
  // { href: "/academy", label: "academy", icon: "book" },
] as const;

export function SiteNav() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsMenuOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  function isActive(href: (typeof NAV_ITEMS)[number]["href"]) {
    return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  }

  function renderLinks(size: "desktop" | "mobile") {
    return NAV_ITEMS.map((item) => {
      const active = isActive(item.href);

      return (
        <Link
          key={item.href}
          href={item.href}
          aria-current={active ? "page" : undefined}
          onClick={() => setIsMenuOpen(false)}
          className={`flex items-center gap-1 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
            size === "desktop"
              ? "min-h-10 px-2 text-sm"
              : "min-h-12 px-4 text-base"
          } ${
            active
              ? "bg-black/[.06] text-black dark:bg-white/[.12] dark:text-white"
              : "text-zinc-600 hover:bg-black/[.04] hover:text-black dark:text-zinc-300 dark:hover:bg-white/[.06] dark:hover:text-white"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-6 w-6 shrink-0 fill-none stroke-current stroke-[1.75]"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {item.icon === "home" ? (
              <path d="m3 10 9-7 9 7M5 9v11h14V9m-9 11v-6h4v6" />
            ) : (
              <path d="M12 7.5c-2-1.5-5-2-8-1v13c3-.8 6-.4 8 1 2-1.4 5-1.8 8-1v-13c-3-1-6-.5-8 1zm0 0v13" />
            )}
          </svg>
          {t(item.label)}
        </Link>
      );
    });
  }

  return (
    <>
      <nav aria-label={t("label")} className="hidden items-center gap-1 sm:flex">
        {renderLinks("desktop")}
      </nav>

      <button
        type="button"
        aria-label={t(isMenuOpen ? "closeMenu" : "openMenu")}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-site-navigation"
        onClick={() => setIsMenuOpen((open) => !open)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 transition-colors hover:bg-black/[.05] hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground sm:hidden dark:text-zinc-300 dark:hover:bg-white/[.08] dark:hover:text-white"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-5 w-5 fill-none stroke-current stroke-2"
          strokeLinecap="round"
        >
          {isMenuOpen ? (
            <path d="m6 6 12 12M18 6 6 18" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      <nav
        id="mobile-site-navigation"
        aria-label={t("label")}
        className={`absolute inset-x-0 top-full border-b border-black/[.08] bg-zinc-50/95 px-4 py-3 shadow-lg backdrop-blur-md sm:hidden dark:border-white/[.12] dark:bg-zinc-950/95 ${
          isMenuOpen ? "block" : "hidden"
        }`}
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-1">
          {renderLinks("mobile")}
        </div>
      </nav>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const t = useTranslations("Layout");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams.entries());
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={t("languageLabel")}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-black/[.05] hover:text-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:text-zinc-400 dark:hover:bg-white/[.08] dark:hover:text-zinc-100"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="h-5 w-5 fill-current"
        >
          <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm7.93 9h-2.95a15.65 15.65 0 0 0-1.38-5.56A8.03 8.03 0 0 1 19.93 11ZM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96ZM4.26 14a8.1 8.1 0 0 1 0-4h3.38a16.8 16.8 0 0 0 0 4H4.26Zm.81 2h2.95c.32 2.02.79 3.9 1.38 5.56A8.03 8.03 0 0 1 5.07 16Zm2.95-8H5.07a8.03 8.03 0 0 1 4.33-5.56A15.65 15.65 0 0 0 8.02 8ZM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96ZM14.34 14H9.66a14.83 14.83 0 0 1 0-4h4.68a14.83 14.83 0 0 1 0 4Zm.25 5.56c.59-1.66 1.06-3.54 1.38-5.56h2.95a8.03 8.03 0 0 1-4.33 5.56ZM16.36 12a15.65 15.65 0 0 0-1.38-5.56h2.95A8.03 8.03 0 0 1 19.93 12h-3.57Z" />
        </svg>
      </button>
      {isOpen && (
        <div
          role="group"
          aria-label={t("languageOptions")}
          className="absolute right-0 top-full z-50 mt-2 min-w-36 rounded-xl border border-black/[.08] bg-white p-1.5 text-sm shadow-lg dark:border-white/[.12] dark:bg-zinc-900"
        >
          {routing.locales.map((loc) => {
            const languageName = loc === "en" ? "English" : "Español";
            const active = locale === loc;

            return (
              <Link
                key={loc}
                href={{ pathname, query }}
                locale={loc}
                aria-current={active ? "true" : undefined}
                onClick={() => setIsOpen(false)}
                className={`flex min-h-10 items-center justify-between rounded-lg px-3 transition-colors ${
                  active
                    ? "bg-black/[.05] font-semibold text-black dark:bg-white/[.1] dark:text-white"
                    : "text-zinc-600 hover:bg-black/[.04] dark:text-zinc-300 dark:hover:bg-white/[.06]"
                }`}
              >
                <span>{languageName}</span>
                <span className="text-xs uppercase tracking-wide text-zinc-400">
                  {loc}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

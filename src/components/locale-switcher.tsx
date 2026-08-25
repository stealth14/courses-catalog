"use client";

import { Fragment } from "react";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = Object.fromEntries(searchParams.entries());

  return (
    <div className="ml-auto flex h-10 items-center gap-2 text-xs font-semibold uppercase tracking-wide">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-4 w-4 shrink-0 fill-current text-zinc-400 dark:text-zinc-500"
      >
        <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm7.93 9h-2.95a15.65 15.65 0 0 0-1.38-5.56A8.03 8.03 0 0 1 19.93 11ZM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96ZM4.26 14a8.1 8.1 0 0 1 0-4h3.38a16.8 16.8 0 0 0 0 4H4.26Zm.81 2h2.95c.32 2.02.79 3.9 1.38 5.56A8.03 8.03 0 0 1 5.07 16Zm2.95-8H5.07a8.03 8.03 0 0 1 4.33-5.56A15.65 15.65 0 0 0 8.02 8ZM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96ZM14.34 14H9.66a14.83 14.83 0 0 1 0-4h4.68a14.83 14.83 0 0 1 0 4Zm.25 5.56c.59-1.66 1.06-3.54 1.38-5.56h2.95a8.03 8.03 0 0 1-4.33 5.56ZM16.36 12a15.65 15.65 0 0 0-1.38-5.56h2.95A8.03 8.03 0 0 1 19.93 12h-3.57Z" />
      </svg>
      {routing.locales.map((loc, index) => {
        const active = locale === loc;

        return (
          <Fragment key={loc}>
            {index > 0 && (
              <span
                aria-hidden="true"
                className="h-3 w-px bg-zinc-300 dark:bg-zinc-600"
              />
            )}
            <Link
              href={{ pathname, query }}
              locale={loc}
              aria-current={active ? "true" : undefined}
              className={`inline-flex min-h-10 select-none items-center rounded-md px-1.5 transition-colors [-webkit-tap-highlight-color:transparent] ${
                active
                  ? "text-black dark:text-white"
                  : "text-zinc-400 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
              }`}
            >
              {loc.toUpperCase()}
            </Link>
          </Fragment>
        );
      })}
    </div>
  );
}

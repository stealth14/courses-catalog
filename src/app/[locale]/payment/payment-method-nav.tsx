"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const METHODS = [
  { href: "/payment/usdt", key: "methodUsdt" },
  { href: "/payment/btc", key: "methodBtc" },
] as const;

export function PaymentMethodNav() {
  const t = useTranslations("PaymentHeader");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("methodsLabel")}
      className="flex rounded-full border border-black/[.08] bg-zinc-50 p-1 dark:border-white/[.145] dark:bg-black"
    >
      {METHODS.map((method) => {
        const active = pathname === method.href;

        return (
          <Link
            key={method.href}
            href={method.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 flex-1 items-center justify-center rounded-full px-4 py-2.5 text-center text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
              active
                ? "bg-foreground text-background"
                : "text-zinc-600 hover:bg-black/[.04] dark:text-zinc-300 dark:hover:bg-white/[.06]"
            }`}
          >
            {t(method.key)}
          </Link>
        );
      })}
    </nav>
  );
}

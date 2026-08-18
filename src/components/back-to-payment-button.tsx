"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const ROUTES_WITH_BACK = ["/payment/usdt", "/payment/btc"];

export function BackToPaymentButton() {
  const t = useTranslations("PaymentHeader");
  const pathname = usePathname();

  if (!ROUTES_WITH_BACK.includes(pathname)) return null;

  return (
    <Link
      href="/payment"
      aria-label={t("backLabel")}
      className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-600 transition-opacity hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:text-zinc-300"
    >
      <svg
        viewBox="0 0 20 20"
        aria-hidden="true"
        className="h-4 w-4 fill-current"
      >
        <path
          fillRule="evenodd"
          d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
          clipRule="evenodd"
        />
      </svg>
    </Link>
  );
}

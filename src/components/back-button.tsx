"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Link, usePathname } from "@/i18n/navigation";

type BackTarget = {
  href: string;
  labelKey: "backLabel" | "backToPaymentLabel" | "back";
  /** Query params to preserve from the current URL onto the back link. */
  queryFrom?: string[];
};

/**
 * Semantic back targets for routes whose "back" destination is not
 * their immediate parent in the route hierarchy. Any route not listed
 * here falls back to its parent path automatically.
 */
const BACK_OVERRIDES: Record<string, BackTarget> = {
  "/payment/methods": {
    href: "/appointment",
    labelKey: "back",
    queryFrom: ["product"],
  },
  "/payment/usdt": {
    href: "/payment/methods",
    labelKey: "backLabel",
    queryFrom: ["product"],
  },
  "/payment/btc": {
    href: "/payment/methods",
    labelKey: "backLabel",
    queryFrom: ["product"],
  },
  "/payment/binance": {
    href: "/payment/methods",
    labelKey: "backLabel",
    queryFrom: ["product"],
  },
  "/payment/whatsapp": {
    href: "/payment/methods",
    labelKey: "backLabel",
    queryFrom: ["product"],
  },
  "/appointment": { href: "/shop", labelKey: "back" },
};

function parentOf(pathname: string): string | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  const parent = segments.slice(0, -1).join("/");
  return parent === "" ? "/" : `/${parent}`;
}

/**
 * Renders a back arrow on every page that has a parent in the app's
 * navigation history (everything except the home page). Rendered from
 * the root locale layout, so it appears seamlessly on all screens.
 */
export function BackButton() {
  const t = useTranslations("PaymentHeader");
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const target =
    BACK_OVERRIDES[pathname] ?? { href: parentOf(pathname), labelKey: "back" };

  if (!target.href) return null;

  const query: Record<string, string> = {};
  for (const key of target.queryFrom ?? []) {
    const value = searchParams.get(key);
    if (value) query[key] = value;
  }

  const href =
    Object.keys(query).length > 0
      ? { pathname: target.href, query }
      : target.href;

  return (
    <Link
      href={href}
      aria-label={t(target.labelKey)}
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

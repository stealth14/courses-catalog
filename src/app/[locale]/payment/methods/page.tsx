import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PaymentHeader } from "../payment-header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PaymentHub");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

const METHODS = [
  {
    href: "/payment/usdt",
    icon: "₮",
    iconClass: "text-emerald-600 dark:text-emerald-400",
    nameKey: "methodUsdt",
    descKey: "methodUsdtDesc",
  },
  {
    href: "/payment/btc",
    icon: "₿",
    iconClass: "text-[#F7931A]",
    nameKey: "methodBtc",
    descKey: "methodBtcDesc",
  },
  // TODO: Re-enable the Binance payment option when ready.
  // {
  //   href: "/payment/binance",
  //   icon: "B",
  //   iconClass: "text-[#F0B90B]",
  //   nameKey: "methodBinance",
  //   descKey: "methodBinanceDesc",
  // },
] as const;

export default async function PaymentMethodsPage() {
  const t = await getTranslations("PaymentHub");
  const th = await getTranslations("PaymentHeader");

  return (
    <>
      <PaymentHeader variant="compact" />

      <div className="flex flex-col gap-3">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("subtitle")}
        </p>

        {METHODS.map(({ href, icon, iconClass, nameKey, descKey }) => (
          <Link
            key={href}
            href={href}
            className="group flex items-center gap-4 rounded-2xl border border-black/[.08] p-4 text-left transition-all hover:border-black/[.15] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground active:scale-[0.99] dark:border-white/[.145] dark:hover:border-white/[.25] sm:p-5"
          >
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold dark:bg-white/[.08] ${iconClass}`}
            >
              {icon}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-black dark:text-zinc-50">
                {th(nameKey)}
              </span>
              <span className="block text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                {t(descKey)}
              </span>
            </span>
            <svg
              viewBox="0 0 20 20"
              aria-hidden="true"
              className="h-4 w-4 shrink-0 fill-current text-zinc-400 transition-transform group-hover:translate-x-0.5"
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        ))}
      </div>
    </>
  );
}

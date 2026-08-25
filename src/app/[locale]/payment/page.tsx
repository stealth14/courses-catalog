import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PaymentHeader } from "./payment-header";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PaymentHub");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

export default async function PaymentIndexPage() {
  const t = await getTranslations("PaymentHub");
  const th = await getTranslations("PaymentHeader");

  return (
    <>
      <PaymentHeader variant="full" />

      <div className="flex flex-col gap-3">
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("subtitle")}
        </p>

        <Link
          href="/payment/usdt"
          className="group flex items-center gap-4 rounded-2xl border border-black/[.08] p-4 text-left transition-all hover:border-black/[.15] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground active:scale-[0.99] dark:border-white/[.145] dark:hover:border-white/[.25] sm:p-5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold text-emerald-600 dark:bg-white/[.08] dark:text-emerald-400">
            ₮
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-black dark:text-zinc-50">
              {th("methodUsdt")}
            </span>
            <span className="block text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              {t("methodUsdtDesc")}
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

        <Link
          href="/payment/btc"
          className="group flex items-center gap-4 rounded-2xl border border-black/[.08] p-4 text-left transition-all hover:border-black/[.15] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground active:scale-[0.99] dark:border-white/[.145] dark:hover:border-white/[.25] sm:p-5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold text-[#F7931A] dark:bg-white/[.08]">
            ₿
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-black dark:text-zinc-50">
              {th("methodBtc")}
            </span>
            <span className="block text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              {t("methodBtcDesc")}
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

        <Link
          href="/payment/binance"
          className="group flex items-center gap-4 rounded-2xl border border-black/[.08] p-4 text-left transition-all hover:border-black/[.15] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground active:scale-[0.99] dark:border-white/[.145] dark:hover:border-white/[.25] sm:p-5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold text-[#F0B90B] dark:bg-white/[.08]">
            ◆
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-black dark:text-zinc-50">
              {th("methodBinance")}
            </span>
            <span className="block text-xs leading-5 text-zinc-500 dark:text-zinc-400">
              {t("methodBinanceDesc")}
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
      </div>
    </>
  );
}

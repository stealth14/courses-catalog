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
          className="group flex items-center gap-4 rounded-xl border border-black/[.08] p-4 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.06]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-base font-bold text-emerald-600 dark:bg-white/[.08] dark:text-emerald-400">
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
          <span
            aria-hidden="true"
            className="text-zinc-400 transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>

        <Link
          href="/payment/btc"
          className="group flex items-center gap-4 rounded-xl border border-black/[.08] p-4 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-white/[.06]"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-base font-bold text-[#F7931A] dark:bg-white/[.08]">
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
          <span
            aria-hidden="true"
            className="text-zinc-400 transition-transform group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>
    </>
  );
}

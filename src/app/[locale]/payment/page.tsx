import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CopyButton } from "./copy-button";

// Public USDT (ERC-20) wallet address used to collect payments.
// Override with NEXT_PUBLIC_USDT_WALLET in .env.local if needed.
const USDT_WALLET =
  process.env.NEXT_PUBLIC_USDT_WALLET ??
  "0x15afF0830f275c9691a73B2DFCB001cc33f9AB5E";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PaymentPage");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

export default async function PaymentPage() {
  const t = await getTranslations("PaymentPage");

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-24 font-sans dark:bg-black">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-black/[.08] bg-white p-8 dark:border-white/[.145] dark:bg-[#111]">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            {t("walletLabel")}
          </span>
          <div className="flex items-center gap-2 rounded-xl border border-black/[.08] bg-zinc-50 p-4 dark:border-white/[.145] dark:bg-black">
            <code className="min-w-0 flex-1 break-all font-mono text-sm text-black dark:text-zinc-50">
              {USDT_WALLET}
            </code>
            <CopyButton address={USDT_WALLET} />
          </div>
        </div>

        <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {t("warning")}
        </p>
      </div>
    </main>
  );
}

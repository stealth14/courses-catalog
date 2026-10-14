import { getTranslations } from "next-intl/server";
import { ArrowIcon } from "@/components/arrow-icon";
import { Link } from "@/i18n/navigation";
import { getWallets } from "@/lib/wallet-incidents";

/**
 * Knowledge base index listing every wallet in `public/wallet-incidents.json`
 * with its most recent documented incident as the subtitle, so the page
 * stays a table of contents even as the data file grows.
 */
export default async function KnowledgePage() {
  const t = await getTranslations("WalletKnowledge");
  const wallets = await getWallets();

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {t("indexTitle")}
        </h2>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("indexBody")}
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {wallets.map((wallet) => (
          <li key={wallet.id} className="flex">
            <Link
              href={`/academy/knowledge/${wallet.id}`}
              aria-label={`${wallet.name}: ${t("indexEntryCta")}`}
              className="group flex flex-1 items-center gap-3 rounded-2xl border border-black/[.08] p-3 transition-colors hover:border-black/[.16] hover:bg-black/[.02] dark:border-white/[.145] dark:hover:border-white/[.25] dark:hover:bg-white/[.04]"
            >
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-[11px] font-bold tracking-wide text-zinc-600 ring-1 ring-black/[.06] dark:bg-white/[.08] dark:text-zinc-200 dark:ring-white/[.08]"
              >
                {wallet.monogram}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-black dark:text-zinc-50">
                {wallet.name}
              </span>
              <ArrowIcon className="h-4 w-4 text-[#9A5B00] dark:text-amber-400" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

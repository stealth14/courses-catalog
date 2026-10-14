import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getWallets } from "@/lib/wallet-incidents";
import { BrandList } from "./brand-list";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("WalletKnowledge");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

/**
 * Knowledge base shell. The brand picker lives in this layout so it stays
 * mounted while the reader moves between entries: the nested routes under
 * `/academy/knowledge` only swap the panel beside it, and the page owns the
 * single `<h1>` so entries can start at `<h2>`.
 *
 * The wallet list comes from `public/wallet-incidents.json`, so a wallet
 * added there appears in the picker and gets its own entry route. Only the
 * fields the picker renders cross into the client component; the data
 * loader itself reads the filesystem and cannot ship to the browser.
 */
export default async function KnowledgeLayout({
  children,
}: LayoutProps<"/[locale]/academy/knowledge">) {
  const t = await getTranslations("WalletKnowledge");

  const wallets = await getWallets();
  const brands = wallets.map(({ id, name, monogram }) => ({
    id,
    name,
    monogram,
  }));

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 pt-10 pb-10 sm:px-6 sm:pt-16 sm:pb-16">
        <header className="flex flex-col gap-3">
          <h1 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-zinc-50">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
            {t("subtitle")}
          </p>
        </header>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <BrandList brands={brands} />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </main>
  );
}

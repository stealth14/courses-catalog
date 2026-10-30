import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { KeyAccessDiagram } from "./key-access-diagram";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("DiagramsPage");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

/**
 * Key access diagram. Each wallet is picked from a small set of concrete
 * setups and shows what can reach the user's private keys while that setup
 * is in use.
 */
export default async function KeyAccessDiagramPage() {
  const t = await getTranslations("DiagramsPage");

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 pt-8 pb-10 sm:px-6 sm:pt-8 sm:pb-16">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-zinc-50">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
            {t("subtitle")}
          </p>
        </header>

        <KeyAccessDiagram />
      </div>
    </main>
  );
}

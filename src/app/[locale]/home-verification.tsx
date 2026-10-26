import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * Distils the strongest claim on the site — the live one-to-one on-chain
 * demonstration documented on `/transparency` — onto the landing page,
 * where it can do the persuading instead of a summary line.
 */
export async function HomeVerification() {
  const t = await getTranslations("HomePage");

  return (
    <section className="flex flex-col items-center gap-4 rounded-2xl border border-primary/25 bg-gradient-to-b from-primary/[.09] to-transparent px-6 py-8 text-center dark:border-primary/20 dark:from-primary/[.12]">
      <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {t("verification.title")}
      </h2>
      <p className="max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {t("verification.body")}
      </p>
      <Link
        href="/transparency"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-primary/35 px-5 text-sm font-medium text-primary-deep transition-colors hover:bg-primary/10 dark:border-primary/35 dark:text-primary-soft dark:hover:bg-primary/15"
      >
        {t("verification.cta")}
      </Link>
    </section>
  );
}

import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/** Closing call to action for visitors who read the whole page. */
export async function HomeFinalCta() {
  const t = await getTranslations("HomePage");

  return (
    <section className="flex flex-col items-center gap-4 text-center">
      <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {t("finalCta.title")}
      </h2>
      <p className="max-w-xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {t("finalCta.body")}
      </p>
      <Link
        href="/shop"
        className="flex h-12 items-center justify-center gap-2 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        {t("cta")}
      </Link>
    </section>
  );
}

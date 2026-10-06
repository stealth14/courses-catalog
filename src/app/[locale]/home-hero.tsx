import { getTranslations } from "next-intl/server";

/**
 * Landing hero. Owns the page's only `<h1>`: the ownership promise and
 * the mechanism behind it.
 */
export async function HomeHero() {
  const t = await getTranslations("HomePage");

  return (
    <section className="flex flex-col items-center gap-5 text-center">
      <span className="rounded-full border border-[#F7931A]/30 bg-[#F7931A]/[.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#9A5B00] dark:border-[#F7931A]/25 dark:bg-[#F7931A]/[.12] dark:text-amber-400">
        {t("hero.eyebrow")}
      </span>

      <h1 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-zinc-50">
        {t("hero.title")}
      </h1>

      <p className="max-w-2xl text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
        {t("hero.subtitle")}
      </p>
    </section>
  );
}

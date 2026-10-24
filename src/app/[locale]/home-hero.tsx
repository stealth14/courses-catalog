import { getTranslations } from "next-intl/server";
import { LearningLinks } from "@/components/learning-links";

/**
 * Landing hero. Owns the page's only `<h1>`: the ownership promise and
 * the mechanism behind it.
 */
export async function HomeHero() {
  const t = await getTranslations("HomePage");

  return (
    <section
      id="home-hero"
      className="flex flex-col items-center gap-6 text-center sm:gap-10"
    >
      {/* Display-scale promise: the only element that gets the biggest type
          step, so the page reads top-down from here. */}
      <h1 className="max-w-[22ch] text-balance text-[clamp(2.5rem,8vw,8rem)] font-semibold leading-[0.95] tracking-[-0.04em] text-black dark:text-zinc-50">
        {t("hero.title")}
      </h1>

      <div className="flex w-full flex-col items-center gap-5 sm:w-auto sm:flex-row sm:gap-8">
        <p className="max-w-md text-pretty text-base leading-7 text-zinc-600 sm:text-lg dark:text-zinc-400">
          {t("hero.subtitle")}
        </p>
        <LearningLinks size="hero" className="shrink-0 flex-wrap justify-center" />
      </div>
    </section>
  );
}

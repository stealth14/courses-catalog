import { getTranslations } from "next-intl/server";

/**
 * Landing hero. Owns the page's only `<h1>`: the ownership promise and
 * the mechanism behind it.
 */
export async function HomeHero() {
  const t = await getTranslations("HomePage");
  const tNav = await getTranslations("Nav");

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
        {/* Jumps to the profile section's WhatsApp CTA instead of the academy. */}
        <a
          href="#profile"
          className="inline-flex h-14 w-full max-w-xs shrink-0 items-center justify-center rounded-full border border-primary bg-primary px-7 text-base font-semibold whitespace-nowrap text-zinc-950 shadow-[0_0_32px_10px_color-mix(in_srgb,var(--primary-color)_40%,transparent)] transition select-none [-webkit-tap-highlight-color:transparent] hover:bg-primary-hover hover:shadow-[0_0_44px_14px_color-mix(in_srgb,var(--primary-color)_55%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-deep active:scale-95 sm:w-auto sm:max-w-none dark:focus-visible:outline-primary-soft"
        >
          {tNav("learnForFree")}
        </a>
      </div>
    </section>
  );
}

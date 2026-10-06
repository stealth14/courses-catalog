import { getTranslations } from "next-intl/server";

/**
 * What the visitor is actually committing to. The shop and appointment
 * pages previously had nothing explaining the sessions that precede them.
 */
export async function HomeHowItWorks() {
  const t = await getTranslations("HomePage");

  const steps = [
    { title: t("howItWorks.step1Title"), body: t("howItWorks.step1Body") },
    { title: t("howItWorks.step2Title"), body: t("howItWorks.step2Body") },
    { title: t("howItWorks.step3Title"), body: t("howItWorks.step3Body") },
  ];

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {t("howItWorks.title")}
        </h2>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("howItWorks.subtitle")}
        </p>
      </div>

      <ol className="flex flex-col gap-4 sm:flex-row sm:gap-5">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="flex flex-1 flex-col items-start gap-2 rounded-2xl border border-black/[.08] p-5 dark:border-white/[.145]"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#F7931A]/30 bg-[#F7931A]/[.08] text-xs font-semibold text-[#9A5B00] dark:border-[#F7931A]/25 dark:bg-[#F7931A]/[.12] dark:text-amber-400">
              {index + 1}
            </span>
            <h3 className="text-sm font-semibold tracking-tight text-black dark:text-zinc-50">
              {step.title}
            </h3>
            <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

import { getTranslations } from "next-intl/server";

/**
 * Objection handling. This is where the abstraction-vs-ease-of-use
 * argument is made in detail, while the hero only names the mechanism.
 * Uses native <details> so the section needs no client JavaScript.
 */
export async function HomeFaq() {
  const t = await getTranslations("HomePage");

  const faqs = [
    { question: t("faq.q1"), answer: t("faq.a1") },
    { question: t("faq.q2"), answer: t("faq.a2") },
    { question: t("faq.q3"), answer: t("faq.a3") },
    { question: t("faq.q4"), answer: t("faq.a4") },
  ];

  return (
    <section className="flex flex-col gap-5">
      <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {t("faq.title")}
      </h2>

      <div className="flex flex-col divide-y divide-black/[.08] border-y border-black/[.08] dark:divide-white/[.145] dark:border-white/[.145]">
        {faqs.map(({ question, answer }) => (
          <details key={question} className="group py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium text-black [&::-webkit-details-marker]:hidden dark:text-zinc-50">
              {question}
              <svg
                viewBox="0 0 20 20"
                aria-hidden="true"
                className="h-4 w-4 shrink-0 fill-current text-zinc-400 transition-transform group-open:rotate-180 dark:text-zinc-500"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.168l3.71-3.938a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                  clipRule="evenodd"
                />
              </svg>
            </summary>
            <p className="pt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
              {answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}

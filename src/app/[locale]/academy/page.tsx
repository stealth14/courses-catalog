import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowIcon } from "@/components/arrow-icon";
import { RecommendedPosts } from "@/components/recommended-posts";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AcademyPage");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

const CONTENT_GROUPS = [
  {
    key: "fundamentals",
    topics: ["bitcoinBasics", "transactions", "blockchain", "consensus"],
  },
  {
    key: "advanced",
    topics: ["architectures", "threatModels", "multisig", "mentorship"],
  },
] as const;

/**
 * Academy index. The contents are grouped as a learning path, with
 * available destinations linked and future topics presented as scaffolding.
 */
export default async function AcademyPage() {
  const t = await getTranslations("AcademyPage");

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 pt-8 pb-10 sm:px-6 sm:pt-8 sm:pb-16">
        <header className="flex flex-col items-center gap-3 text-center">
          <h1 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-zinc-50">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
            {t("subtitle")}
          </p>
        </header>

        <RecommendedPosts
          loadingText={t("recommendedLoading")}
          errorText={t("recommendedLoadError")}
        />

        <nav
          aria-label={t("contentsLabel")}
          className="flex flex-col gap-10"
        >
          {CONTENT_GROUPS.map((group, groupIndex) => (
            <section
              key={group.key}
              aria-labelledby={`academy-${group.key}`}
              className="flex flex-col"
            >
              <div className="mb-3 flex items-baseline gap-3 border-b border-black/[.12] pb-3 dark:border-white/[.16]">
                <span className="font-mono text-xs tracking-widest text-[#9A5B00] dark:text-amber-400">
                  {String(groupIndex + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2
                    id={`academy-${group.key}`}
                    className="text-lg font-semibold tracking-tight text-black dark:text-zinc-50"
                  >
                    {t(`contents.${group.key}.title`)}
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {t(`contents.${group.key}.description`)}
                  </p>
                </div>
              </div>

              <ol className="divide-y divide-black/[.08] dark:divide-white/[.1]">
                {group.topics.map((topic, topicIndex) => {
                  const href =
                    topic === "architectures"
                      ? "/academy/knowledge"
                      : topic === "mentorship"
                        ? "/academy/premium"
                        : null;

                  return (
                    <li
                      key={topic}
                      className="grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-start gap-3 py-4 sm:gap-5"
                    >
                      <span className="pt-0.5 font-mono text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                        {String(topicIndex + 1).padStart(2, "0")}
                      </span>
                      <div className="flex min-w-0 flex-col gap-1">
                        <h3 className="text-sm font-medium text-black dark:text-zinc-50">
                          {href ? (
                            <Link
                              href={href}
                              className="underline decoration-black/20 underline-offset-4 hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:decoration-white/25"
                            >
                              {t(`contents.topics.${topic}.title`)}
                            </Link>
                          ) : (
                            t(`contents.topics.${topic}.title`)
                          )}
                        </h3>
                        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                          {t(`contents.topics.${topic}.description`)}
                        </p>
                      </div>
                      {href ? (
                        <Link
                          href={href}
                          aria-label={`${t(`contents.topics.${topic}.title`)} — ${t("openTopic")}`}
                          className="inline-flex min-h-8 items-center gap-1.5 whitespace-nowrap text-xs font-medium text-[#9A5B00] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:text-amber-400"
                        >
                          <span className="hidden sm:inline">{t("openTopic")}</span>
                          <ArrowIcon />
                        </Link>
                      ) : (
                        <span className="pt-1 text-right text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                          {t("comingSoon")}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </nav>
      </div>
    </main>
  );
}

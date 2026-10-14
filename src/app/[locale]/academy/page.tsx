import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ArrowIcon } from "@/components/arrow-icon";
import { Link } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AcademyPage");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

/** The learning surfaces the academy currently links to. */
const SECTIONS = [
  { href: "/academy/premium", key: "premium" },
  { href: "/academy/knowledge", key: "knowledge" },
] as const;

/**
 * Academy index. A simple shelf for now: one card per section, with the
 * copy and routing owned by each section's own page.
 */
export default async function AcademyPage() {
  const t = await getTranslations("AcademyPage");

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 pt-10 pb-10 sm:px-6 sm:pt-16 sm:pb-16">
        <header className="flex flex-col gap-3">
          <h1 className="max-w-2xl text-balance text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-zinc-50">
            {t("title")}
          </h1>
          <p className="max-w-2xl text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
            {t("subtitle")}
          </p>
        </header>

        <ul className="grid gap-4 sm:grid-cols-2">
          {SECTIONS.map((section) => (
            <li key={section.href} className="flex">
              <Link
                href={section.href}
                className="group flex flex-1 flex-col gap-3 rounded-2xl border border-black/[.08] p-4 transition-colors hover:border-black/[.16] hover:bg-black/[.02] dark:border-white/[.145] dark:hover:border-white/[.25] dark:hover:bg-white/[.04]"
              >
                <h2 className="text-sm font-semibold tracking-tight text-black dark:text-zinc-50">
                  {t(`sections.${section.key}.title`)}
                </h2>
                <p className="flex-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {t(`sections.${section.key}.body`)}
                </p>
                <span className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-[#9A5B00] dark:text-amber-400">
                  {t(`sections.${section.key}.cta`)}
                  <ArrowIcon />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

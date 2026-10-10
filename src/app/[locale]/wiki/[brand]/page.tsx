import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowIcon } from "@/components/arrow-icon";
import { Link } from "@/i18n/navigation";
import { getWalletDiagrams } from "@/lib/wallet-architectures";
import {
  getWallets,
  localizedParagraphs,
  localizedText,
  type WalletRecord,
} from "@/lib/wallet-incidents";
import { WalletDiagram } from "./wallet-diagram";

const SECTION_LABEL =
  "text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9A5B00] dark:text-amber-400";

/** Dashed shell used wherever the data file has no copy yet. */
const PENDING_BOX =
  "rounded-2xl border border-dashed border-black/[.16] p-4 text-sm italic leading-6 text-zinc-500 dark:border-white/[.25] dark:text-zinc-400";

const BODY = "text-sm leading-6 text-zinc-600 dark:text-zinc-400";

/** Every wallet in the data file, prerendered per locale. */
export async function generateStaticParams() {
  const wallets = await getWallets();

  return wallets.map(({ id }) => ({ brand: id }));
}

async function findWallet(id: string): Promise<WalletRecord | null> {
  const wallets = await getWallets();

  return wallets.find((wallet) => wallet.id === id) ?? null;
}

export async function generateMetadata(
  props: PageProps<"/[locale]/wiki/[brand]">
): Promise<Metadata> {
  const { brand } = await props.params;
  const wallet = await findWallet(brand);

  if (!wallet) return {};

  const t = await getTranslations("WalletWiki");

  return {
    title: t("entryMetadataTitle", { wallet: wallet.name }),
    description: t("entryMetadataDescription", { wallet: wallet.name }),
  };
}

/**
 * One wiki entry, rendered entirely from `public/wallet-incidents.json`:
 * architecture container, every incident recorded for the wallet, then the
 * article body. Add a wallet — or another incident for one already here —
 * to the data file and this page follows, including its route.
 *
 * Nothing in the data file is mandatory beyond the id, name and monogram,
 * so entry text that has not been written yet renders as an explicit
 * placeholder instead of an empty section.
 */
export default async function WalletWikiEntryPage(
  props: PageProps<"/[locale]/wiki/[brand]">
) {
  const { brand } = await props.params;
  const wallet = await findWallet(brand);

  if (!wallet) notFound();

  const t = await getTranslations("WalletWiki");
  const locale = await getLocale();
  const article = localizedParagraphs(wallet.article, locale);
  const exposureSummary = localizedText(wallet.exposure?.summary ?? null, locale);
  const exposurePoints = localizedParagraphs(
    wallet.exposure?.points ?? null,
    locale
  );

  return (
    <article className="flex flex-col gap-8">
      <header className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-[11px] font-bold tracking-wide text-zinc-600 ring-1 ring-black/[.06] dark:bg-white/[.08] dark:text-zinc-200 dark:ring-white/[.08]"
        >
          {wallet.monogram}
        </span>
        <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {wallet.name}
        </h2>
      </header>

      <section className="flex flex-col gap-3">
        <h3 className={SECTION_LABEL}>{t("diagramTitle")}</h3>
        <WalletDiagram
          src={getWalletDiagrams().get(wallet.id) ?? null}
          alt={t("diagramAlt", { wallet: wallet.name })}
          caption={t("diagramPending", { wallet: wallet.name })}
          labels={{
            host: t("placeholder.host"),
            hostHint: t("placeholder.hostHint"),
            txOut: t("placeholder.txOut"),
            txIn: t("placeholder.txIn"),
            firmware: t("placeholder.firmware"),
            keys: t("placeholder.keys"),
          }}
        />
      </section>

      {wallet.exposure ? (
        <section className="flex flex-col gap-3">
          <h3 className={SECTION_LABEL}>{t("exposureTitle")}</h3>

          <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
            {exposureSummary ? <p className={BODY}>{exposureSummary}</p> : null}

            {exposurePoints ? (
              <ul className="flex flex-col gap-2">
                {exposurePoints.map((point, index) => (
                  <li key={index} className="flex gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#9A5B00] dark:bg-amber-400"
                    />
                    <span className={BODY}>{point}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            {wallet.exposure.sources.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                  {t("sourcesTitle")}
                </p>
                {wallet.exposure.sources.map((source) => (
                  <a
                    key={source.url}
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 self-start text-xs font-medium text-zinc-600 underline-offset-4 transition-colors hover:underline dark:text-zinc-300"
                  >
                    {source.label}
                    <svg
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                      aria-hidden="true"
                      className="h-3 w-3 shrink-0"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.5 14.5 14.5 5.5m0 0H7.75m6.75 0v6.75"
                      />
                    </svg>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h3 className={SECTION_LABEL}>{t("incidentTitle")}</h3>

        {wallet.incidents.length === 0 ? (
          <p className={PENDING_BOX}>
            {t("incidentPending", { wallet: wallet.name })}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {wallet.incidents.map((incident, index) => {
              const date = localizedText(incident.date, locale);
              const summary = localizedText(incident.summary, locale);
              const details = localizedParagraphs(incident.details, locale);

              return (
                <li
                  key={index}
                  className="flex flex-col gap-2 rounded-2xl border border-black/[.08] p-4 dark:border-white/[.145]"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
                    {date ?? t("datePending")}
                  </p>

                  <p
                    className={
                      summary
                        ? "text-sm leading-6 text-zinc-700 dark:text-zinc-300"
                        : "text-sm italic leading-6 text-zinc-500 dark:text-zinc-400"
                    }
                  >
                    {summary ?? t("summaryPending", { wallet: wallet.name })}
                  </p>

                  {details?.map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex} className={BODY}>
                      {paragraph}
                    </p>
                  ))}

                  {incident.source ? (
                    <a
                      href={incident.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 self-start text-xs font-medium text-zinc-600 underline-offset-4 transition-colors hover:underline dark:text-zinc-300"
                    >
                      {t("incidentSource")}
                      <svg
                        viewBox="0 0 20 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.75}
                        aria-hidden="true"
                        className="h-3 w-3"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5.5 14.5 14.5 5.5m0 0H7.75m6.75 0v6.75"
                        />
                      </svg>
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h3 className={SECTION_LABEL}>{t("articleTitle")}</h3>

        {article ? (
          article.map((paragraph, index) => (
            <p key={index} className={BODY}>
              {paragraph}
            </p>
          ))
        ) : (
          <p className={PENDING_BOX}>{t("articlePending")}</p>
        )}
      </section>

      <section className="flex flex-col items-start gap-2 rounded-2xl border border-black/[.08] p-5 dark:border-white/[.145]">
        <h3 className="text-base font-semibold tracking-tight text-black dark:text-zinc-50">
          {t("ctaTitle")}
        </h3>
        <p className={BODY}>{t("ctaBody")}</p>
        <Link
          href="/premium"
          className="group mt-1 inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          {t("cta")}
          <ArrowIcon />
        </Link>
      </section>
    </article>
  );
}

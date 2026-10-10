import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowIcon } from "@/components/arrow-icon";
import { Link } from "@/i18n/navigation";
import { getBrandLogos, type BrandLogo } from "@/lib/wallet-logos";
import {
  getWallets,
  localizedText,
  type WalletRecord,
} from "@/lib/wallet-incidents";

/**
 * Side (px) of the square every brand mark is contained in, so wide
 * wordmarks and square icons all sit in the same tile without being
 * squashed.
 */
const LOGO_BOX = 36;

/** Fits a mark inside the `LOGO_BOX` square, keeping its aspect ratio. */
function containInBox(logo: BrandLogo): { width: number; height: number } {
  const scale = LOGO_BOX / Math.max(logo.width, logo.height);

  return {
    width: Math.max(1, Math.round(logo.width * scale)),
    height: Math.max(1, Math.round(logo.height * scale)),
  };
}

/**
 * Original monogram badge shown when a licensed logo is not present. Hues
 * are assigned by position in the data file so a wallet added there gets
 * its own color without touching this list, and the colors stay our own
 * palette rather than the brands' trade dress.
 */
const MONOGRAM_PALETTE = [
  "bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300",
  "bg-lime-100 text-lime-700 dark:bg-lime-950/60 dark:text-lime-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300",
];

/**
 * Hardware-wallet graveyard: a horizontally scrolling row of the wallets
 * that asked to be trusted with seed phrases and then lost that trust in
 * public. Each card names a dated, documented incident, not an opinion,
 * and links into the wallet wiki, where the incident is expanded and the
 * diagram of the device lives.
 *
 * Everything on a card comes from `public/wallet-incidents.json`: the
 * first incident listed for a wallet is the one the row shows, and a
 * wallet whose copy is not written yet falls back to placeholders rather
 * than breaking the row.
 *
 * A mark is shown when the wallet's logo file is on file; otherwise the
 * card falls back to an original monogram badge, so the row documents
 * every wallet instead of only the ones whose artwork we have.
 *
 * Cards lay the mark beside the copy instead of stacking it above, so the
 * row stays short and the sections below stay a short scroll away.
 */
export async function HomeWalletScandals() {
  const t = await getTranslations("HomePage");
  const locale = await getLocale();
  const logos = getBrandLogos();
  const wallets = await getWallets();

  if (wallets.length === 0) return null;


  const card = (wallet: WalletRecord, index: number) => {
    const logo = logos.get(wallet.id);
    const box = logo ? containInBox(logo) : null;
    // The row carries one incident per wallet: the first one listed.
    const incident = wallet.incidents[0] ?? null;
    const date = localizedText(incident?.date ?? null, locale);
    const summary = localizedText(incident?.summary ?? null, locale);
    const monogram = MONOGRAM_PALETTE[index % MONOGRAM_PALETTE.length];

    return (
      <li
        key={wallet.id}
        className="group flex w-80 shrink-0 items-center gap-3 rounded-2xl border border-black/[.08] bg-white p-3 transition-colors hover:border-black/[.16] dark:border-white/[.145] dark:bg-[#111] dark:hover:border-white/[.25]"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-zinc-100 p-2 dark:bg-white">
          {logo && box ? (
            <span
              className="relative block"
              style={{ width: `${box.width}px`, height: `${box.height}px` }}
            >
              <Image
                src={logo.src}
                alt={wallet.name}
                fill
                sizes={`${LOGO_BOX}px`}
                className="object-contain"
              />
            </span>
          ) : (
            <>
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tracking-wide ${monogram}`}
              >
                {wallet.monogram}
              </span>
              <span className="sr-only">{wallet.name}</span>
            </>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A5B00] dark:text-amber-400">
              {date ?? t("scandals.datePending")}
            </p>

            <Link
              href={`/wiki/${wallet.id}`}
              aria-label={`${wallet.name}: ${t("scandals.sourceCta")}`}
              className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full border border-black/[.08] px-2.5 text-[11px] font-medium text-zinc-700 transition-colors hover:border-black/[.16] hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-200 dark:hover:border-white/[.25] dark:hover:bg-white/[.06]"
            >
              {t("scandals.sourceCta")}
              <ArrowIcon className="h-3 w-3" />
            </Link>
          </div>

          <p
            className={
              summary
                ? "mt-1.5 text-[11px] leading-4 text-zinc-600 dark:text-zinc-400"
                : "mt-1.5 text-[11px] italic leading-4 text-zinc-500 dark:text-zinc-400"
            }
          >
            {summary ?? t("scandals.bodyPending")}
          </p>
        </div>
      </li>
    );
  };

  const group = (hidden: boolean) => (
    <ul className="flex shrink-0 gap-4 pr-4" aria-hidden={hidden || undefined}>
      {wallets.map(card)}
    </ul>
  );

  return (
    <section className="flex flex-col gap-6">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-1 px-4 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight text-[#9A5B00] dark:text-amber-400">
          {t("scandals.title")}
        </h2>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("scandals.subtitle")}
        </p>
      </div>

      <div className="wallet-marquee-viewport overflow-hidden px-4 sm:px-6">
        <div className="wallet-marquee flex w-max py-1">
          {group(false)}
          {group(true)}
          {group(true)}
          {group(true)}
        </div>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6">
        <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          {t("scandals.footnote")}
        </p>
      </div>
    </section>
  );
}

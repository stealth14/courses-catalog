import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  getBrandLogos,
  HARDWARE_WALLET_BRANDS,
  type HardwareWalletBrand,
} from "@/lib/hardware-wallets";

/**
 * Shared display height (px) for every brand mark in the logo tile. Wide
 * wordmarks get a wider box derived from their aspect ratio, square icons
 * stay square — all centred on the same line.
 */
const LOGO_HEIGHT = 56;

/**
 * Original monogram badge shown when a licensed logo is not present. Each
 * brand gets its own hue so the cards are scannable at a glance; the
 * colors are our own palette, not the brands' trade dress.
 */
const MONOGRAM_CLASSES: Record<string, string> = {
  ledger: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300",
  trezor: "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300",
  coldcard:
    "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
  tangem: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300",
  keepkey: "bg-lime-100 text-lime-700 dark:bg-lime-950/60 dark:text-lime-300",
  bitbox02:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
  safepal:
    "bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300",
  ellipal:
    "bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300",
};

/**
 * Hardware-wallet graveyard: a horizontally scrolling row of the brands
 * that asked to be trusted with seed phrases and then lost that trust in
 * public. Each card names a dated, documented incident, not an opinion.
 */
export async function HomeWalletScandals() {
  const t = await getTranslations("HomePage");
  const logos = getBrandLogos();

  // Only show brands that have a logo asset in `public/wallets-brands`;
  // the rest are hidden until their logo lands, per the current design.
  const visibleBrands = HARDWARE_WALLET_BRANDS.filter((brand) =>
    logos.has(brand.id)
  );

  if (visibleBrands.length === 0) return null;

  const card = (brand: HardwareWalletBrand) => {
    const logo = logos.get(brand.id);

    // Every mark shares the same display height; the box width follows the
    // asset's intrinsic aspect ratio so wordmarks and icons both centre in
    // the tile without being squashed.
    const boxWidth = logo
      ? Math.round(LOGO_HEIGHT * (logo.width / logo.height))
      : LOGO_HEIGHT;

    return (
      <li
        key={brand.id}
        className="flex w-80 shrink-0 flex-col rounded-2xl border border-black/[.08] bg-white p-5 dark:border-white/[.145] dark:bg-[#111]"
      >
        <div className="flex h-20 items-center justify-center rounded-xl bg-zinc-100 px-4 dark:bg-white">
          {logo ? (
            <span
              className="relative block h-14"
              style={{ width: `${boxWidth}px` }}
            >
              <Image
                src={logo.src}
                alt={brand.name}
                fill
                sizes={`${boxWidth}px`}
                className="object-contain"
              />
            </span>
          ) : (
            <>
              <span
                aria-hidden="true"
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tracking-wide ${MONOGRAM_CLASSES[brand.id]}`}
              >
                {brand.monogram}
              </span>
              <span className="truncate text-base font-semibold tracking-tight text-zinc-700 dark:text-zinc-200">
                {brand.name}
              </span>
            </>
          )}
        </div>

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9A5B00] dark:text-amber-400">
          {t(`scandals.brands.${brand.id}.date`)}
        </p>

        <p className="mt-2 flex-1 text-xs leading-5 text-zinc-600 dark:text-zinc-400">
          {t(`scandals.brands.${brand.id}.incident`)}
        </p>

        <a
          href={brand.source}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${brand.name}: ${t("scandals.sourceCta")}`}
          className="mt-4 inline-flex h-9 items-center justify-center gap-2 rounded-full border border-black/[.08] px-4 text-xs font-medium text-zinc-700 transition-colors hover:border-black/[.16] hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-200 dark:hover:border-white/[.25] dark:hover:bg-white/[.06]"
        >
          {t("scandals.sourceCta")}
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            aria-hidden="true"
            className="h-3.5 w-3.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.5 14.5 14.5 5.5m0 0H7.75m6.75 0v6.75"
            />
          </svg>
        </a>
      </li>
    );
  };

  const group = (hidden: boolean) => (
    <ul className="flex shrink-0 gap-4 pr-4" aria-hidden={hidden || undefined}>
      {visibleBrands.map(card)}
    </ul>
  );

  return (
    <section className="my-16 flex flex-col gap-6 sm:my-20">
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

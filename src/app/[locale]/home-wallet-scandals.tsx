import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  getBrandLogos,
  HARDWARE_WALLET_BRANDS,
  type BrandLogo,
  type HardwareWalletBrand,
} from "@/lib/hardware-wallets";

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
 *
 * Cards lay the mark beside the copy instead of stacking it above, so the
 * row stays short and the sections below stay a short scroll away.
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

    const box = logo ? containInBox(logo) : null;

    return (
      <li
        key={brand.id}
        className="flex w-80 shrink-0 items-center gap-3 rounded-2xl border border-black/[.08] bg-white p-3 dark:border-white/[.145] dark:bg-[#111]"
      >
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-zinc-100 p-2 dark:bg-white">
          {logo && box ? (
            <span
              className="relative block"
              style={{ width: `${box.width}px`, height: `${box.height}px` }}
            >
              <Image
                src={logo.src}
                alt={brand.name}
                fill
                sizes={`${LOGO_BOX}px`}
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
              <span className="sr-only">{brand.name}</span>
            </>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9A5B00] dark:text-amber-400">
              {t(`scandals.brands.${brand.id}.date`)}
            </p>

            <a
              href={brand.source}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${brand.name}: ${t("scandals.sourceCta")}`}
              className="inline-flex h-6 shrink-0 items-center gap-1 rounded-full border border-black/[.08] px-2.5 text-[11px] font-medium text-zinc-700 transition-colors hover:border-black/[.16] hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-200 dark:hover:border-white/[.25] dark:hover:bg-white/[.06]"
            >
              {t("scandals.sourceCta")}
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
          </div>

          <p className="mt-1.5 text-[11px] leading-4 text-zinc-600 dark:text-zinc-400">
            {t(`scandals.brands.${brand.id}.incident`)}
          </p>
        </div>
      </li>
    );
  };

  const group = (hidden: boolean) => (
    <ul className="flex shrink-0 gap-4 pr-4" aria-hidden={hidden || undefined}>
      {visibleBrands.map(card)}
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

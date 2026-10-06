import { existsSync } from "node:fs";
import path from "node:path";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import {
  HARDWARE_WALLET_BRANDS,
  type HardwareWalletBrand,
} from "@/lib/hardware-wallets";

const LOGO_DIR = path.join(process.cwd(), "public", "brands");

/**
 * Logos are optional, licensed assets dropped into `public/brands` at
 * build time. A brand whose file is missing falls back to a plain
 * wordmark, so the row never renders a broken image.
 */
function logoFor(brand: HardwareWalletBrand): string | null {
  if (!brand.logo) return null;

  return existsSync(path.join(LOGO_DIR, brand.logo))
    ? `/brands/${brand.logo}`
    : null;
}

/**
 * Hardware-wallet graveyard: a horizontally scrolling row of the brands
 * that asked to be trusted with seed phrases and then lost that trust in
 * public. Each card names a documented incident, not an opinion.
 */
export async function HomeWalletScandals() {
  const t = await getTranslations("HomePage");

  const card = (brand: HardwareWalletBrand, logo: string | null) => (
    <li
      key={brand.id}
      className="flex w-72 shrink-0 flex-col gap-3 rounded-2xl border border-black/[.08] bg-white p-4 dark:border-white/[.145] dark:bg-[#111]"
    >
      <div className="flex h-7 items-center">
        {logo ? (
          <span className="relative block h-7 w-28">
            <Image
              src={logo}
              alt={brand.name}
              fill
              sizes="112px"
              className="object-contain object-left"
            />
          </span>
        ) : (
          <span className="text-base font-semibold tracking-tight text-zinc-700 dark:text-zinc-200">
            {brand.name}
          </span>
        )}
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9A5B00] dark:text-amber-400">
        {t(`scandals.brands.${brand.id}.year`)}
      </p>

      <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">
        {t(`scandals.brands.${brand.id}.incident`)}
      </p>
    </li>
  );

  const group = (className: string, hidden: boolean) => (
    <ul className={className} aria-hidden={hidden || undefined}>
      {HARDWARE_WALLET_BRANDS.map((brand) => card(brand, logoFor(brand)))}
    </ul>
  );

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {t("scandals.title")}
        </h2>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("scandals.subtitle")}
        </p>
      </div>

      <div className="wallet-marquee-viewport -mx-4 overflow-hidden sm:-mx-6">
        <div className="wallet-marquee flex w-max py-1">
          {group("flex gap-4 pr-4", false)}
          {group("wallet-marquee-copy flex gap-4 pr-4", true)}
        </div>
      </div>

      <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-500">
        {t("scandals.footnote")}
      </p>
    </section>
  );
}

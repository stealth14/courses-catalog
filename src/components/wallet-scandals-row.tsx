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

const LOGO_BOX = 36;

function containInBox(logo: BrandLogo): { width: number; height: number } {
  const scale = LOGO_BOX / Math.max(logo.width, logo.height);

  return {
    width: Math.max(1, Math.round(logo.width * scale)),
    height: Math.max(1, Math.round(logo.height * scale)),
  };
}

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

export async function WalletScandalsRow() {
  const t = await getTranslations("WalletScams");
  const locale = await getLocale();
  const logos = getBrandLogos();
  const wallets = await getWallets();

  if (wallets.length === 0) return null;

  const card = (wallet: WalletRecord, index: number) => {
    const logo = logos.get(wallet.id);
    const box = logo ? containInBox(logo) : null;
    const incident = wallet.incidents[0] ?? null;
    const date = localizedText(incident?.date ?? null, locale);
    const summary = localizedText(incident?.summary ?? null, locale);
    const monogram = MONOGRAM_PALETTE[index % MONOGRAM_PALETTE.length];

    return (
      <li
        key={wallet.id}
        className="group flex w-[min(18rem,calc(100vw-2rem))] shrink-0 flex-col gap-2.5 rounded-2xl border border-black/[.08] bg-white p-3 transition-colors hover:border-black/[.16] sm:w-60 dark:border-white/[.145] dark:bg-[#111] dark:hover:border-white/[.25]"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-100 p-1 dark:bg-white">
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
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold tracking-wide ${monogram}`}
                >
                  {wallet.monogram}
                </span>
                <span className="sr-only">{wallet.name}</span>
              </>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {wallet.name}
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500 dark:text-zinc-400">
              {date ?? t("datePending")}
            </p>
          </div>
        </div>

        <p
          className={`line-clamp-3 text-xs leading-[1.15rem] sm:line-clamp-2 ${
            summary
              ? "text-zinc-600 dark:text-zinc-400"
              : "italic text-zinc-500 dark:text-zinc-400"
          }`}
        >
          {summary ?? t("bodyPending")}
        </p>

        <Link
          href={`/academy/knowledge/${wallet.id}`}
          aria-label={`${wallet.name}: ${t("sourceCta")}`}
          className="inline-flex h-7 shrink-0 self-start items-center gap-1 rounded-full border border-black/[.08] px-2.5 text-[11px] font-medium text-zinc-700 transition-colors hover:border-black/[.16] hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-200 dark:hover:border-white/[.25] dark:hover:bg-white/[.06]"
        >
          {t("sourceCta")}
          <ArrowIcon className="h-3 w-3" />
        </Link>
      </li>
    );
  };

  const group = (hidden: boolean) => (
    <ul className="flex shrink-0 gap-3 pr-3" aria-hidden={hidden || undefined}>
      {wallets.map(card)}
    </ul>
  );

  return (
    <section className="flex flex-col gap-3">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-1 px-4 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {t("title")}
        </h2>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("subtitle")}
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
          {t("footnote")}
        </p>
      </div>
    </section>
  );
}

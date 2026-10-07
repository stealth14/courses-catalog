"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { SecuredWallet } from "@/lib/secured-wallets";

/** Bitcoin-orange palette; slices cycle through it. */
const SLICE_COLORS = [
  "#F7931A",
  "#FBBF24",
  "#D97706",
  "#FCD34D",
  "#B45309",
  "#FB923C",
];

const SIZE = 100;
const CENTER = SIZE / 2;
const R_OUTER = 44;
const R_INNER = 26;

/** Cartesian point for `angleDeg` (0 = top, growing clockwise) at `radius`. */
function point(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + Math.cos(rad) * radius,
    y: CENTER + Math.sin(rad) * radius,
  };
}

/** Donut-slice path between two angles. */
function slicePath(startDeg: number, endDeg: number) {
  const outerStart = point(startDeg, R_OUTER);
  const outerEnd = point(endDeg, R_OUTER);
  const innerEnd = point(endDeg, R_INNER);
  const innerStart = point(startDeg, R_INNER);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${R_INNER} ${R_INNER} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

function shorten(address: string) {
  return `${address.slice(0, 10)}…${address.slice(-6)}`;
}

const color = (index: number) => SLICE_COLORS[index % SLICE_COLORS.length];

/**
 * Donut chart of the secured BTC wallets. Hovering (or focusing) a slice
 * fills a details panel placed OUTSIDE the donut, beside it on desktop and
 * below it on mobile — keeping the slices fully visible and reachable —
 * with the BTC amount, its USD estimate, its share and a link to audit
 * that address on a public block explorer. Clicking a slice pins the
 * selection so it stays reachable on touch devices.
 */
export function WalletPieChart({
  wallets,
  explorer,
  btcPriceUsd,
  initialAddress,
}: {
  wallets: SecuredWallet[];
  explorer: string;
  btcPriceUsd: number;
  initialAddress?: string;
}) {
  const locale = useLocale();
  const t = useTranslations("TransparencyPage");
  const [hovered, setHovered] = useState<number | null>(null);
  const [pinned, setPinned] = useState<number | null>(() => {
    const index = wallets.findIndex((w) => w.address === initialAddress);
    return index >= 0 ? index : null;
  });

  const active = hovered ?? pinned;

  const totalBtc = wallets.reduce((sum, wallet) => sum + wallet.btc, 0);
  const totalUsd = totalBtc * btcPriceUsd;

  const btcFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 8,
  });
  const usdFormatter = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: totalUsd >= 1000 ? 0 : 2,
  });
  const percentFormatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 1,
  });

  const formatBtc = (value: number) => btcFormatter.format(value);
  const formatUsd = (value: number) => usdFormatter.format(value);
  const host = new URL(explorer).host;

  /** Screen-reader description: address first, then optional label + balances. */
  const describe = (wallet: SecuredWallet) =>
    [
      shorten(wallet.address),
      wallet.label,
      `${formatBtc(wallet.btc)} BTC`,
      `≈ ${formatUsd(wallet.btc * btcPriceUsd)}`,
    ]
      .filter(Boolean)
      .join(" · ");

  if (wallets.length === 0) {
    return (
      <p className="py-8 text-center text-sm leading-6 text-zinc-500 dark:text-zinc-400">
        {t("empty")}
      </p>
    );
  }

  const shares = wallets.map((wallet) => wallet.btc / totalBtc);
  const slices = wallets.map((wallet, index) => {
    const share = shares[index];
    const start =
      shares.slice(0, index).reduce((sum, value) => sum + value, 0) * 360;

    return { wallet, index, share, start, end: start + share * 360 };
  });

  const activeSlice = active === null ? null : slices[active];

  return (
    <div className="flex flex-col gap-10 sm:gap-12">
      {/* The donut and the figures share one row: the chart gets the width
          the narrow checkout card never had, and the details stay outside
          it so every slice remains visible and reachable. */}
      <section
        className="flex flex-col gap-8 sm:flex-row sm:items-center sm:gap-12"
        onMouseLeave={() => setHovered(null)}
      >
        <div className="mx-auto aspect-square w-full max-w-56 shrink-0 sm:mx-0 sm:w-72 sm:max-w-none">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            role="img"
            aria-label={t("chartAlt", { count: wallets.length })}
            className="block h-full w-full"
          >
            {slices.length === 1 ? (
              <circle
                cx={CENTER}
                cy={CENTER}
                r={(R_OUTER + R_INNER) / 2}
                fill="none"
                stroke={color(0)}
                strokeWidth={R_OUTER - R_INNER}
              />
            ) : (
              slices.map((slice) => (
                <path
                  key={slice.wallet.address}
                  d={slicePath(slice.start, slice.end)}
                  fill={color(slice.index)}
                  role="button"
                  tabIndex={0}
                  aria-label={describe(slice.wallet)}
                  /* Hairline in the page colour separates the slices; the
                     browser's focus ring is replaced by the highlighted
                     outline drawn on top of the selected slice below. */
                  className={`cursor-pointer stroke-zinc-50 outline-none transition-opacity [-webkit-tap-highlight-color:transparent] dark:stroke-black ${
                    active === null || active === slice.index
                      ? "opacity-100"
                      : "opacity-40"
                  }`}
                  strokeWidth={0.75}
                  onMouseEnter={() => setHovered(slice.index)}
                  onFocus={() => setHovered(slice.index)}
                  onBlur={() => setHovered(null)}
                  onClick={() =>
                    setPinned(pinned === slice.index ? null : slice.index)
                  }
                />
              ))
            )}
            {activeSlice && slices.length > 1 ? (
              <path
                d={slicePath(activeSlice.start, activeSlice.end)}
                fill="none"
                strokeWidth={1.25}
                strokeLinejoin="round"
                aria-hidden="true"
                className="pointer-events-none stroke-zinc-900 dark:stroke-white"
              />
            ) : null}
          </svg>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {/* Total secured: the dollar figure leads — it is the number
              people compare — with the exact BTC amount under it. */}
          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9A5B00] dark:text-amber-400">
              {t("totalLabel")}
            </p>
            <p className="flex items-baseline gap-1 text-3xl font-semibold tracking-tight text-black tabular-nums sm:text-4xl dark:text-zinc-50">
              <span
                aria-hidden="true"
                className="text-lg font-normal text-zinc-400 dark:text-zinc-500"
              >
                ≈
              </span>
              {formatUsd(totalUsd)}
            </p>
            <p className="flex items-baseline gap-1.5 text-sm font-medium">
              <span className="tabular-nums text-zinc-700 dark:text-zinc-300">
                {formatBtc(totalBtc)}
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
                BTC
              </span>
            </p>
          </div>

          {/* Details sit OUTSIDE the chart so the donut stays visible and
              hoverable; fixed height keeps the layout from jumping. */}
          <div className="flex min-h-32 flex-col justify-center gap-1 rounded-2xl border border-black/[.08] p-4 dark:border-white/[.145]">
            {activeSlice ? (
              <>
                <p className="min-w-0 truncate text-xs">
                  <span className="font-mono font-medium text-black dark:text-zinc-50">
                    {shorten(activeSlice.wallet.address)}
                  </span>
                  {activeSlice.wallet.label ? (
                    <span className="text-zinc-500 dark:text-zinc-400">
                      {" · "}
                      {activeSlice.wallet.label}
                    </span>
                  ) : null}
                </p>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="flex items-baseline gap-1.5 text-sm font-semibold tabular-nums text-black dark:text-zinc-50">
                    {formatBtc(activeSlice.wallet.btc)}
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
                      BTC
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                    ≈ {formatUsd(activeSlice.wallet.btc * btcPriceUsd)} ·{" "}
                    {percentFormatter.format(activeSlice.share * 100)}%
                  </span>
                </div>
                <a
                  href={`${explorer}/address/${activeSlice.wallet.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-center gap-1.5 rounded-full bg-foreground px-3 py-2 text-xs font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
                >
                  <span className="truncate">
                    {t("viewOnExplorer", { host })}
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                    className="h-3 w-3 shrink-0 fill-current"
                  >
                    <path d="M11 3a1 1 0 1 0 0 2h2.586l-6.293 6.293a1 1 0 1 0 1.414 1.414L15 6.414V9a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-5Z" />
                    <path d="M5 5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a1 1 0 1 0-2 0v3H5V7h3a1 1 0 0 0 0-2H5Z" />
                  </svg>
                </a>
              </>
            ) : (
              <p className="text-center text-xs text-zinc-400 dark:text-zinc-500">
                {t("hoverHint")}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Same treatment as the landing page's verification card: the
          strongest claim gets the accent border, not another plain box. */}
      <section className="flex flex-col gap-3 rounded-2xl border border-[#F7931A]/25 bg-gradient-to-b from-[#F7931A]/[.09] to-transparent px-6 py-8 dark:border-[#F7931A]/20 dark:from-[#F7931A]/[.12]">
        <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-5 w-5 shrink-0 fill-[#F7931A]"
          >
            <path
              fillRule="evenodd"
              d="M14.615 1.595a.75.75 0 0 1 .359.852L12.982 9.75h7.268a.75.75 0 0 1 .548 1.262l-10.5 11.25a.75.75 0 0 1-1.272-.71l1.992-7.302H3.75a.75.75 0 0 1-.548-1.262l10.5-11.25a.75.75 0 0 1 .913-.143Z"
              clipRule="evenodd"
            />
          </svg>
          {t("proofTitle")}
        </h2>
        <p className="max-w-3xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("proofText")}
        </p>
      </section>

      {/* The slices spelled out as rows, so each address can be read and
          audited on its own instead of only through the chart. */}
      <ul className="flex flex-col divide-y divide-black/[.08] border-y border-black/[.08] dark:divide-white/[.145] dark:border-white/[.145]">
        {wallets.map((wallet, index) => (
          <li key={wallet.address}>
            <div
              className={`flex items-center gap-4 px-3 py-3 transition-colors ${
                active === index ? "bg-[#F7931A]/[.07]" : ""
              }`}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: color(index) }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-xs font-medium text-black dark:text-zinc-50">
                  {shorten(wallet.address)}
                </p>
                {wallet.label ? (
                  <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {wallet.label}
                  </p>
                ) : null}
              </div>
              <div className="shrink-0 text-right">
                <p className="flex items-baseline justify-end gap-1.5 text-sm font-semibold tabular-nums text-black dark:text-zinc-50">
                  {formatBtc(wallet.btc)}
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-400 dark:text-zinc-500">
                    BTC
                  </span>
                </p>
                <p className="text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                  {formatUsd(wallet.btc * btcPriceUsd)}
                </p>
              </div>
              <a
                href={`${explorer}/address/${wallet.address}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("viewOnExplorer", { host })}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/[.08] text-zinc-600 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-300 dark:hover:bg-white/[.06]"
              >
                <svg
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  className="h-3.5 w-3.5 fill-current"
                >
                  <path d="M11 3a1 1 0 1 0 0 2h2.586l-6.293 6.293a1 1 0 1 0 1.414 1.414L15 6.414V9a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-5Z" />
                  <path d="M5 5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-3a1 1 0 1 0-2 0v3H5V7h3a1 1 0 0 0 0-2H5Z" />
                </svg>
              </a>
            </div>
          </li>
        ))}
      </ul>

      <p className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
        {t("priceNote", { price: formatUsd(btcPriceUsd) })}
      </p>
    </div>
  );
}

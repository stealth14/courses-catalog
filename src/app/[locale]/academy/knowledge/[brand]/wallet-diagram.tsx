import Image from "next/image";

/** Labels for the placeholder block diagram, straight from the catalog. */
export type WalletDiagramLabels = {
  host: string;
  hostHint: string;
  txOut: string;
  txIn: string;
  firmware: string;
  keys: string;
};

/**
 * Architecture container for a knowledge base entry.
 *
 * Renders the schematic dropped into `public/wallet-architectures` when
 * there is one — `next/image` passes SVG sources through untouched — and
 * otherwise a labelled placeholder of the usual flow: the host builds an
 * unsigned transaction, the device signs it back. The placeholder exists so
 * an entry keeps its shape before the real drawing is in place.
 */
export function WalletDiagram({
  src,
  alt,
  caption,
  labels,
}: {
  /** Public URL of the schematic, or null while it is still pending. */
  src: string | null;
  alt: string;
  caption: string;
  labels: WalletDiagramLabels;
}) {
  if (src) {
    return (
      <figure className="flex flex-col gap-2">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-black/[.08] bg-white dark:border-white/[.145] dark:bg-[#111]">
          <Image
            src={src}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 640px, 100vw"
            className="object-contain"
          />
        </div>
        <figcaption className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
          {caption}
        </figcaption>
      </figure>
    );
  }

  return (
    <figure className="flex flex-col gap-3 rounded-2xl border border-dashed border-black/[.16] bg-white p-4 dark:border-white/[.25] dark:bg-[#111]">
      <div className="grid grid-cols-[1fr_auto_1.15fr] items-center gap-2 sm:gap-4">
        {/* The untrusted side: whatever also holds the seed's ciphertext. */}
        <div className="flex flex-col items-center gap-1 rounded-xl border border-black/[.08] bg-zinc-50 px-2 py-4 text-center dark:border-white/[.145] dark:bg-white/[.04]">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-zinc-700 sm:text-[11px] dark:text-zinc-200">
            {labels.host}
          </span>
          <span className="text-[9px] leading-tight text-zinc-500 sm:text-[10px] dark:text-zinc-400">
            {labels.hostHint}
          </span>
        </div>

        {/* What crosses the link, in both directions. */}
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-[9px] leading-tight text-zinc-500 sm:text-[10px] dark:text-zinc-400">
            {labels.txOut}
          </span>
          <svg
            viewBox="0 0 36 12"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3 w-8 shrink-0 text-zinc-400 dark:text-zinc-500"
          >
            <path d="M3 6h30" />
            <path d="M7 2 3 6l4 4" />
            <path d="M29 2l4 4-4 4" />
          </svg>
          <span className="text-[9px] leading-tight text-zinc-500 sm:text-[10px] dark:text-zinc-400">
            {labels.txIn}
          </span>
        </div>

        {/* The box every brand's real schematic replaces. */}
        <div className="flex flex-col gap-2 rounded-xl border border-black/[.08] p-2 dark:border-white/[.145]">
          <div className="rounded-lg bg-zinc-100 px-2 py-3 text-center dark:bg-white/[.06]">
            <span className="text-[10px] font-medium text-zinc-700 sm:text-[11px] dark:text-zinc-200">
              {labels.firmware}
            </span>
          </div>
          <div className="rounded-lg bg-emerald-50 px-2 py-3 text-center dark:bg-emerald-950/50">
            <span className="text-[10px] font-medium text-emerald-800 sm:text-[11px] dark:text-emerald-300">
              {labels.keys}
            </span>
          </div>
        </div>
      </div>

      <figcaption className="text-xs leading-5 text-zinc-500 dark:text-zinc-400">
        {caption}
      </figcaption>
    </figure>
  );
}

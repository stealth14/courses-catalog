import { CopyButton } from "./copy-button";

export function WalletDisplay({ label, address, qr, qrAlt, }: {
  label?: string;
  address: string;
  qr: string;
  qrAlt: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      {label ? (
        <span className="self-start text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
          {label}
        </span>
      ) : null}
      <div className="shrink-0 rounded-xl bg-white p-2 ring-1 ring-black/[.08] dark:ring-white/[.145]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qr}
          alt={qrAlt}
          width={176}
          height={176}
          className="h-44 w-44"
        />
      </div>
      <div className="flex w-full items-center gap-2 rounded-xl border border-black/[.08] bg-zinc-50 p-4 dark:border-white/[.145] dark:bg-black">
        <code className="min-w-0 flex-1 break-all font-mono text-sm text-black dark:text-zinc-50">
          {address}
        </code>
        <CopyButton address={address} />
      </div>
    </div>
  );
}

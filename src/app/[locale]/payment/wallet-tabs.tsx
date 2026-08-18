"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CopyButton } from "./copy-button";

export type NetworkWallet = {
  id: string;
  label: string;
  address: string;
  qr: string;
};

export function WalletTabs({ wallets }: { wallets: NetworkWallet[] }) {
  const t = useTranslations("PaymentPage");
  const [activeId, setActiveId] = useState(wallets[0].id);
  const active = wallets.find((wallet) => wallet.id === activeId) ?? wallets[0];

  return (
    <div className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label={t("networksLabel")}
        className="flex rounded-full border border-black/[.08] bg-zinc-50 p-1 dark:border-white/[.145] dark:bg-black"
      >
        {wallets.map((wallet) => {
          const selected = wallet.id === activeId;

          return (
            <button
              key={wallet.id}
              type="button"
              role="tab"
              id={`tab-${wallet.id}`}
              aria-selected={selected}
              aria-controls={`panel-${wallet.id}`}
              onClick={() => setActiveId(wallet.id)}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                selected
                  ? "bg-foreground text-background"
                  : "text-zinc-600 hover:bg-black/[.04] dark:text-zinc-300 dark:hover:bg-white/[.06]"
              }`}
            >
              {wallet.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`panel-${active.id}`}
        aria-labelledby={`tab-${active.id}`}
        className="flex flex-col items-center gap-4"
      >
        <div className="shrink-0 rounded-xl bg-white p-2 ring-1 ring-black/[.08] dark:ring-white/[.145]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={active.qr}
            alt={t("qrAlt", { network: active.label })}
            width={176}
            height={176}
            className="h-44 w-44"
          />
        </div>
        <div className="flex w-full items-center gap-2 rounded-xl border border-black/[.08] bg-zinc-50 p-4 dark:border-white/[.145] dark:bg-black">
          <code className="min-w-0 flex-1 break-all font-mono text-sm text-black dark:text-zinc-50">
            {active.address}
          </code>
          <CopyButton address={active.address} />
        </div>
      </div>
    </div>
  );
}

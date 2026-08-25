"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { WalletDisplay } from "./wallet-display";
import { PaymentSteps } from "./payment-steps";

export type NetworkWallet = {
  id: string;
  label: string;
  address: string;
  qr: string;
  steps: ReactNode[];
};

export function WalletTabs({
  wallets,
  stepsTitle,
}: {
  wallets: NetworkWallet[];
  stepsTitle: string;
}) {
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
      >
        <WalletDisplay
          address={active.address}
          qr={active.qr}
          qrAlt={t("qrAlt", { network: active.label })}
        />

        {active.steps.length > 0 ? (
          <PaymentSteps stepsTitle={stepsTitle} steps={active.steps} />
        ) : null}
      </div>
    </div>
  );
}

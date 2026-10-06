import { getTranslations } from "next-intl/server";

/**
 * Risk-exposure scale for the wallet types the site talks about, drawn as a
 * vertical timeline: each tier is a row with its danger level on the left,
 * a colored node on the shared rail, and the explanation to the right.
 * Order runs from the setups that trust a third party down to the one that
 * trusts only the holder's own verification.
 */
type WalletRiskTier = {
  /** Translation key suffix under `HomePage.riskScale.tiers`. */
  id: string;
  /** Risk intensity, mapped to a danger color for the node and label. */
  level: number;
};

const WALLET_RISK_TIERS: WalletRiskTier[] = [
  { id: "custodial", level: 5 },
  { id: "hot", level: 4 },
  { id: "commercial-cold", level: 3 },
  { id: "opensource-verifiable", level: 1 },
];

const LEVEL_CLASSES: Record<
  number,
  { text: string; dot: string; ring: string }
> = {
  5: {
    text: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
    ring: "ring-red-500/20",
  },
  4: {
    text: "text-orange-600 dark:text-orange-400",
    dot: "bg-orange-500",
    ring: "ring-orange-500/20",
  },
  3: {
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    ring: "ring-amber-500/20",
  },
  1: {
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    ring: "ring-emerald-500/20",
  },
};

export async function HomeWalletRiskScale() {
  const t = await getTranslations("HomePage");

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight text-black dark:text-zinc-50">
          {t("riskScale.title")}
        </h2>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          {t("riskScale.subtitle")}
        </p>
      </div>

      <ol className="flex flex-col">
        {WALLET_RISK_TIERS.map((tier, index) => {
          const isLast = index === WALLET_RISK_TIERS.length - 1;
          const level = LEVEL_CLASSES[tier.level];

          return (
            <li key={tier.id} className="flex gap-4">
              {/* Danger level, the left edge of the row. */}
              <div className="flex w-16 shrink-0 justify-end pt-1 sm:w-20">
                <span
                  className={`text-[11px] font-semibold uppercase leading-none tracking-wide ${level.text}`}
                >
                  {t(`riskScale.tiers.${tier.id}.label`)}
                </span>
              </div>

              {/* Timeline rail: node plus the connector to the next tier. */}
              <div className="flex w-4 shrink-0 flex-col items-center">
                <span
                  aria-hidden="true"
                  className={`mt-1 h-3 w-3 shrink-0 rounded-full ring-4 ${level.dot} ${level.ring}`}
                />
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className="mt-1 w-px flex-1 bg-zinc-200 dark:bg-white/10"
                  />
                )}
              </div>

              {/* Explanation. */}
              <div className={isLast ? "flex-1 pb-1" : "flex-1 pb-9"}>
                <h3 className="text-sm font-semibold tracking-tight text-black dark:text-zinc-50">
                  {t(`riskScale.tiers.${tier.id}.title`)}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                  {t(`riskScale.tiers.${tier.id}.body`)}
                </p>
                <p className="mt-2 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
                  {t("riskScale.examplesLabel")}
                  <span className="text-zinc-600 dark:text-zinc-300">
                    {t(`riskScale.tiers.${tier.id}.examples`)}
                  </span>
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

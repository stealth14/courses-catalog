import type { Metadata } from "next";
import QRCode from "qrcode";
import { getTranslations } from "next-intl/server";
import { ProfilePhoto } from "@/components/profile-photo";
import { WalletTabs, type NetworkWallet } from "./wallet-tabs";

// Public USDT wallet addresses used to collect payments.
// Override with NEXT_PUBLIC_USDT_ERC20 / NEXT_PUBLIC_USDT_BSC in .env.local.
const USDT_ERC20 =
  process.env.NEXT_PUBLIC_USDT_ERC20 ??
  "0x15afF0830f275c9691a73B2DFCB001cc33f9AB5E";
const USDT_BSC =
  process.env.NEXT_PUBLIC_USDT_BSC ??
  "0x15afF0830f275c9691a73B2DFCB001cc33f9AB5E";

const PROFILE_NAME = "Ronny Cajas";
const LINKEDIN_URL = "https://www.linkedin.com/in/ronny-cajas-089812176/";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("PaymentPage");

  return {
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  };
}

async function buildWallet(
  id: NetworkWallet["id"],
  label: string,
  address: string
): Promise<NetworkWallet> {
  const qr = await QRCode.toDataURL(address, {
    width: 240,
    margin: 1,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  });

  return { id, label, address, qr };
}

export default async function PaymentPage() {
  const t = await getTranslations("PaymentPage");

  const wallets = await Promise.all([
    buildWallet("erc20", t("walletErc20"), USDT_ERC20),
    buildWallet("bsc", t("walletBsc"), USDT_BSC),
  ]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 py-24 font-sans dark:bg-black">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-2xl border border-black/[.08] bg-white p-8 dark:border-white/[.145] dark:bg-[#111]">
        <div className="flex flex-col items-center gap-4 text-center">
          <ProfilePhoto alt={t("photoAlt")} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
              {PROFILE_NAME}
            </h1>
          <div className="mt-5 flex flex-col items-center">
            <div
              aria-hidden="true"
              className="mb-4 h-px w-12 bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-zinc-600"
            />
            <h2 className="flex items-center gap-1.5 text-[15px] leading-6 text-zinc-700 dark:text-zinc-200">
              <span
                aria-hidden="true"
                className="text-base font-semibold text-[#F7931A]"
              >
                ₿
              </span>
              <span className="font-medium tracking-wide">
                {t.rich("roleSelfCustody", {
                  btc: (chunks) => (
                    <span className="font-semibold text-[#F7931A]">
                      {chunks}
                    </span>
                  ),
                })}
              </span>
            </h2>
            <p className="mt-1.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
              <span>{t("roleDeveloper")}</span>
              <span
                aria-hidden="true"
                className="h-0.5 w-0.5 rounded-full bg-zinc-400 dark:bg-zinc-600"
              />
              <span>{t("roleLeader")}</span>
            </p>
          </div>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("linkedinLabel")}
              className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/[.08] px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-black/[.04] dark:border-white/[.145] dark:text-zinc-200 dark:hover:bg-white/[.06]"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-4 w-4 fill-current"
              >
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
              </svg>
              LinkedIn
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            {t("subtitle")}
          </p>
          <WalletTabs wallets={wallets} />
        </div>

        <p className="rounded-lg bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {t("warning")}
        </p>
      </div>
    </main>
  );
}

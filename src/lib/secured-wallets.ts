import { readFile } from "node:fs/promises";
import path from "node:path";

/** One BTC wallet the mentorship helped secure. */
export type SecuredWallet = {
  address: string;
  /** Human label (hardware wallet, student, plan…). Null when not provided. */
  label: string | null;
  /** Balance in BTC (also the weight used by the pie chart). */
  btc: number;
};

export type SecuredWallets = {
  /** Public block explorer base URL, e.g. https://mempool.space */
  explorer: string;
  /** BTC/USD price used to display USD estimates. */
  btcPriceUsd: number;
  /** True while the file still ships example data instead of real wallets. */
  sample: boolean;
  wallets: SecuredWallet[];
};

const FILE_PATH = path.join(process.cwd(), "public", "secured-wallets.json");
const DEFAULT_EXPLORER = "https://mempool.space";

/**
 * Reads and validates the secured-wallet dataset from
 * `public/secured-wallets.json`. Server-only: it feeds both the home
 * page transparency block and the `/transparency` pie chart, and will be
 * swapped for the backend endpoint later (keep the returned shape).
 */
export async function getSecuredWallets(): Promise<SecuredWallets> {
  const raw = await readFile(FILE_PATH, "utf-8");
  const data = JSON.parse(raw) as Partial<SecuredWallets>;

  const explorer = data.explorer ?? DEFAULT_EXPLORER;
  const btcPriceUsd = data.btcPriceUsd ?? 0;
  const wallets = data.wallets ?? [];

  if (typeof explorer !== "string" || !/^https:\/\/\S+$/.test(explorer)) {
    throw new Error(
      'Invalid public/secured-wallets.json: "explorer" must be an https URL.'
    );
  }

  if (
    typeof btcPriceUsd !== "number" ||
    !Number.isFinite(btcPriceUsd) ||
    btcPriceUsd < 0
  ) {
    throw new Error(
      'Invalid public/secured-wallets.json: "btcPriceUsd" must be a non-negative number.'
    );
  }

  if (!Array.isArray(wallets)) {
    throw new Error(
      'Invalid public/secured-wallets.json: "wallets" must be an array of { address, label?, btc }'
    );
  }

  const parsed = wallets.map((wallet, index) => {
    const address = wallet?.address;
    const label = wallet?.label;
    const btc = wallet?.btc;

    if (typeof address !== "string" || address.trim() === "") {
      throw new Error(
        `Invalid public/secured-wallets.json: wallets[${index}].address must be a non-empty string.`
      );
    }

    if (typeof btc !== "number" || !Number.isFinite(btc) || btc <= 0) {
      throw new Error(
        `Invalid public/secured-wallets.json: wallets[${index}].btc must be a positive number.`
      );
    }

    if (label !== undefined && label !== null && typeof label !== "string") {
      throw new Error(
        `Invalid public/secured-wallets.json: wallets[${index}].label must be a string.`
      );
    }

    return {
      address: address.trim(),
      label: typeof label === "string" && label.trim() !== "" ? label.trim() : null,
      btc,
    };
  });

  if (parsed.length > 0 && btcPriceUsd <= 0) {
    throw new Error(
      'Invalid public/secured-wallets.json: "btcPriceUsd" is required to show USD amounts.'
    );
  }

  return {
    explorer: explorer.trim().replace(/\/+$/, ""),
    btcPriceUsd,
    sample: data.sample === true,
    wallets: parsed,
  };
}

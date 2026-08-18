import { readFile } from "node:fs/promises";
import path from "node:path";

export type PaymentAddresses = {
  usdt: {
    erc20: string;
    bsc: string;
  };
  btc: {
    mainnet: string;
  };
};

const FILE_PATH = path.join(process.cwd(), "public", "payment-addresses.json");

/**
 * Reads and validates wallet addresses from `public/payment-addresses.json`.
 * Server-only: must only be called from server components.
 */
export async function getPaymentAddresses(): Promise<PaymentAddresses> {
  const raw = await readFile(FILE_PATH, "utf-8");
  const data = JSON.parse(raw) as Partial<PaymentAddresses>;

  const erc20 = data.usdt?.erc20;
  const bsc = data.usdt?.bsc;
  const mainnet = data.btc?.mainnet;

  if (
    typeof erc20 !== "string" ||
    typeof bsc !== "string" ||
    typeof mainnet !== "string"
  ) {
    throw new Error(
      'Invalid public/payment-addresses.json: expected { "usdt": { "erc20": string, "bsc": string }, "btc": { "mainnet": string } }'
    );
  }

  return { usdt: { erc20, bsc }, btc: { mainnet } };
}

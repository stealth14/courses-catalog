import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * The hardware-wallet brands the landing page calls out. Each `id` maps to
 * a `HomePage.scandals.brands.<id>` entry in `messages/*.json` holding a
 * dated, publicly documented incident — never an opinion about the brand.
 */
export type HardwareWalletBrand = {
  /** Translation key suffix and logo file stem. */
  id: string;
  /** Display name for the wordmark fallback and the logo alt text. */
  name: string;
  /** Two-letter mark shown in the monogram badge when no logo is present. */
  monogram: string;
  /** URL of the advisory / report the incident copy is based on. */
  source: string;
};

/** Ordered by prominence, most recent incidents first. */
export const HARDWARE_WALLET_BRANDS: HardwareWalletBrand[] = [
  {
    id: "ledger",
    name: "Ledger",
    monogram: "LE",
    source:
      "https://thehackernews.com/2023/12/crypto-hardware-wallet-ledgers-supply.html",
  },
  {
    id: "trezor",
    name: "Trezor",
    monogram: "TR",
    source:
      "https://trezor.io/blog/news/Trezor-response-TROPIC01-chip-disclosure-no-impact-to-your-funds",
  },
  {
    id: "coldcard",
    name: "COLDCARD",
    monogram: "CC",
    source: "https://blog.coinkite.com/coldcard-mk3-seed-generation-warning/",
  },
  {
    id: "tangem",
    name: "Tangem",
    monogram: "TA",
    source:
      "https://donjon.ledger.com/blog/bypassing-tangem-card-security-with-laser-attack/",
  },
  {
    id: "keepkey",
    name: "KeepKey",
    monogram: "KK",
    source:
      "https://blog.kraken.com/product/security/flaw-found-in-keepkey-crypto-hardware-wallet",
  },
  {
    id: "bitbox02",
    name: "BitBox02",
    monogram: "BB",
    source: "https://blog.bitbox.swiss/en/bitbox-08-2026-dixence-update/",
  },
  {
    id: "safepal",
    name: "SafePal",
    monogram: "SP",
    source: "https://www.safepal.com/en/blog/security-update",
  },
  {
    id: "ellipal",
    name: "Ellipal",
    monogram: "EL",
    source: "https://blog.ledger.com/Extracting-Seeds/",
  },
];

const LOGO_DIR = path.join(process.cwd(), "public", "wallets-brands");
const LOGO_EXTENSIONS = new Set([
  ".svg",
  ".png",
  ".webp",
  ".avif",
  ".jpg",
  ".jpeg",
]);

export type BrandLogo = {
  src: string;
  /** Intrinsic pixel size, used to keep the display box on aspect. */
  width: number;
  height: number;
};

/** Reads the IHDR width/height straight out of a PNG header (big-endian). */
function readPngSize(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 24 || buffer.readUInt32BE(0) !== 0x89504e47) return null;

  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);

  return width > 0 && height > 0 ? { width, height } : null;
}

/** Walks JPEG segments to the first SOFn marker that carries dimensions. */
function readJpegSize(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  let offset = 2;

  while (offset < buffer.length) {
    while (offset < buffer.length && buffer[offset] !== 0xff) offset += 1;
    while (offset < buffer.length && buffer[offset] === 0xff) offset += 1;
    if (offset >= buffer.length) return null;

    const marker = buffer[offset++];

    // Standalone markers without a length field.
    if (marker === 0xd8 || marker === 0xd9 || marker === 0x01) continue;
    if (marker >= 0xd0 && marker <= 0xd7) continue;

    if (offset + 2 > buffer.length) return null;
    const length = buffer.readUInt16BE(offset);
    if (length < 2) return null;

    const isSof =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc;

    if (isSof && offset + 7 <= buffer.length) {
      const height = buffer.readUInt16BE(offset + 3);
      const width = buffer.readUInt16BE(offset + 5);
      return width > 0 && height > 0 ? { width, height } : null;
    }

    offset += length;
  }

  return null;
}

/** Detects the format by magic bytes, not by file extension. */
function readImageSize(
  filePath: string
): { width: number; height: number } | null {
  try {
    const buffer = readFileSync(filePath);
    return readPngSize(buffer) ?? readJpegSize(buffer);
  } catch {
    return null;
  }
}

/**
 * Maps each brand id to a logo in `public/wallets-brands`, where the file
 * is named after the id (`ledger.png`, `trezor.png`, …).
 *
 * Logos are licensed assets the brands own, so they are not committed here:
 * you drop the files in and this picks them up. Resolved per render rather
 * than once at module load, so a file added while `next dev` is running
 * appears on the next request. Brands without a matching file simply have
 * no entry, and the landing page hides those cards until a logo arrives.
 */
export function getBrandLogos(): Map<string, BrandLogo> {
  const logos = new Map<string, BrandLogo>();

  if (!existsSync(LOGO_DIR)) return logos;

  for (const file of readdirSync(LOGO_DIR)) {
    const stem = file.slice(0, file.lastIndexOf("."));
    const extension = file.slice(file.lastIndexOf(".")).toLowerCase();

    if (!stem || stem.startsWith(".")) continue;
    if (!LOGO_EXTENSIONS.has(extension)) continue;

    const size = readImageSize(path.join(LOGO_DIR, file));

    logos.set(stem.toLowerCase(), {
      src: `/wallets-brands/${file}`,
      width: size?.width ?? 1,
      height: size?.height ?? 1,
    });
  }

  return logos;
}

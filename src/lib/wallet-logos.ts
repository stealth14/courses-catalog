import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * Licensed brand marks for the wallet row, discovered from
 * `public/wallets-brands`.
 *
 * Logos are assets the brands own and license, so they are not committed
 * here: drop a file in and this picks it up. The file stem must match the
 * wallet id in `public/wallet-incidents.json` (`ledger.png`, `trezor.svg`,
 * …); wallets without a file fall back to their monogram badge.
 *
 * Resolved per render rather than once at module load, so a file added
 * while `next dev` is running appears on the next request.
 */
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
 * Maps each wallet id to the logo file named after it, omitting ids that
 * have no file. Formats whose header we cannot parse still get an entry,
 * with a 1×1 intrinsic size, so the caller can contain it in a fixed box.
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

import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * Optional architecture schematics for the wallet knowledge base, one per
 * wallet.
 *
 * Diagrams are drawn artwork, so they are not committed here: drop a file
 * in `public/wallet-architectures` named after the wallet id —
 * `ledger.svg`, `trezor.png`, `coldcard.webp`, … — and the knowledge base
 * renders it in place of the placeholder block diagram. Wallets without a
 * file keep the placeholder.
 */
const DIAGRAM_DIR = path.join(process.cwd(), "public", "wallet-architectures");

/** Vector first: a schematic belongs in SVG unless only a raster exists. */
const DIAGRAM_EXTENSIONS = [".svg", ".png", ".webp", ".avif", ".jpg", ".jpeg"];

/**
 * Maps each wallet id to the public URL of its schematic, omitting wallets
 * that have no file yet. When a wallet has both a raster and an SVG, the
 * SVG wins.
 *
 * Resolved per render rather than once at module load, so a diagram added
 * while `next dev` is running appears on the next request.
 */
export function getWalletDiagrams(): Map<string, string> {
  const diagrams = new Map<string, string>();

  if (!existsSync(DIAGRAM_DIR)) return diagrams;

  for (const file of readdirSync(DIAGRAM_DIR)) {
    const extension = path.extname(file).toLowerCase();
    const id = path.basename(file, path.extname(file)).toLowerCase();

    if (!id || id.startsWith(".")) continue;
    if (!DIAGRAM_EXTENSIONS.includes(extension)) continue;

    const current = diagrams.get(id);

    if (!current || (extension === ".svg" && !current.endsWith(".svg"))) {
      diagrams.set(id, `/wallet-architectures/${file}`);
    }
  }

  return diagrams;
}

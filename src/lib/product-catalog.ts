import { readFile } from "node:fs/promises";
import path from "node:path";
import { Product, type ProductData } from "@/models/product";

const FILE_PATH = path.join(process.cwd(), "public", "products.json");

/**
 * Server-only catalog loader.
 *
 * Fetches the product catalog from Strapi first and falls back to the
 * bundled `public/products.json` snapshot when the backend is
 * unreachable (e.g. the dev tunnel is down), so server-rendered pages
 * (shop flow, actions) never break.
 */
export async function getProductCatalog(): Promise<Product[]> {
  try {
    const { items } = await Product.search({
      pagination: { pageSize: 100 },
    });

    return items;
  } catch (error) {
    console.warn(
      "[product-catalog] Strapi unreachable — using public/products.json:",
      error
    );

    const raw = await readFile(FILE_PATH, "utf-8");
    const data = JSON.parse(raw) as ProductData[];

    return data.map((entry) => new Product(entry));
  }
}

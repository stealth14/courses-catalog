import { Product } from "@/models/product";

/**
 * Server-only catalog loader.
 *
 * Fetches the product catalog from Strapi. Errors are re-thrown so the
 * server-rendered pages can surface them — there is no local-data
 * fallback.
 */
export async function getProductCatalog(): Promise<Product[]> {
  const { items } = await Product.search({
    pagination: { pageSize: 100 },
  });

  return items;
}

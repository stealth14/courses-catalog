import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * A digital product record that simulates a Strapi v5 content entry:
 * custom fields (`title`, `description`, `price`) plus the standard
 * Strapi v5 fields (`id`, `documentId`, `locale`, `createdAt`,
 * `updatedAt`, `publishedAt`).
 */
export type Product = {
  id: number;
  documentId: string;
  locale: string;
  title: string;
  description: string;
  /** Price in USD. */
  price: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

const FILE_PATH = path.join(process.cwd(), "public", "products.json");

/**
 * Reads and validates the product records from `public/products.json`.
 * Server-only: must only be called from server components.
 */
export async function getProducts(): Promise<Product[]> {
  const raw = await readFile(FILE_PATH, "utf-8");
  const data: unknown = JSON.parse(raw);

  if (!Array.isArray(data)) {
    throw new Error(
      "Invalid public/products.json: expected an array of product records"
    );
  }

  return data.map((entry, index) => {
    const product = entry as Partial<Product>;

    if (
      typeof product.id !== "number" ||
      typeof product.documentId !== "string" ||
      typeof product.title !== "string" ||
      typeof product.description !== "string" ||
      typeof product.price !== "number" ||
      typeof product.createdAt !== "string" ||
      typeof product.updatedAt !== "string"
    ) {
      throw new Error(
        `Invalid public/products.json: malformed product record at index ${index}`
      );
    }

    return {
      id: product.id,
      documentId: product.documentId,
      locale: typeof product.locale === "string" ? product.locale : "en",
      title: product.title,
      description: product.description,
      price: product.price,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      publishedAt:
        typeof product.publishedAt === "string" ? product.publishedAt : null,
    };
  });
}

import { readFile } from "node:fs/promises";
import path from "node:path";

export type ProductInfo = {
  title: string;
  description: string;
};

/**
 * Enumerated values for the `variant` field
 * (Strapi v5 `enumeration` attribute).
 */
export enum ProductVariant {
  /** One-off purchase. */
  SINGLE = "single",
  SUBSCRIPTION = "subscription",
  /** Mentorship / companion service. */
  MENTORSHIP = "mentorship",
}

/**
 * Raw record shape as stored in `public/products.json` (Strapi v5-style
 * content entry: custom `slug`, `variant`, `duration`, localized
 * `information`, `price` plus the standard `id`, `documentId`,
 * `createdAt`, `updatedAt`, `publishedAt`).
 */
export type ProductData = {
  id: number;
  documentId: string;
  slug: string;
  /** Strapi v5 enumeration field. */
  variant: ProductVariant;
  /** Subscription duration in months; null when not applicable. */
  duration?: number | null;
  information: {
    en: ProductInfo;
    es: ProductInfo;
  };
  /** Price in USD. */
  price: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
};

/** A product with its content resolved for a single locale. */
export type LocalizedProduct = {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  /** Strapi v5 enumeration field. */
  variant: ProductVariant;
  /** Subscription duration in months; null when not applicable. */
  duration: number | null;
};

/**
 * Product model. Meant to grow into the app's data layer (e.g. find by
 * slug, persistence); for now it reads the JSON-backed catalog and
 * provides per-locale localization.
 */
export class Product {
  private static readonly FILE_PATH = path.join(
    process.cwd(),
    "public",
    "products.json"
  );

  readonly id: number;
  readonly documentId: string;
  readonly slug: string;
  /** Strapi v5 enumeration field. */
  readonly variant: ProductVariant;
  /** Subscription duration in months; null when not applicable. */
  readonly duration: number | null;
  readonly information: {
    en: ProductInfo;
    es: ProductInfo;
  };
  /** Price in USD. */
  readonly price: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedAt: string | null;

  constructor(data: ProductData) {
    this.id = data.id;
    this.documentId = data.documentId;
    this.slug = data.slug;
    this.variant = data.variant;
    this.duration = data.duration ?? null;
    this.information = data.information;
    this.price = data.price;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.publishedAt = data.publishedAt ?? null;
  }

  /**
   * Reads the product records from `public/products.json`.
   * Data integrity is validated on the server; no validation lives here.
   * Server-only: must only be called from server components.
   */
  static async getProducts(): Promise<Product[]> {
    const raw = await readFile(Product.FILE_PATH, "utf-8");
    const data = JSON.parse(raw) as ProductData[];

    return data.map((entry) => new Product(entry));
  }

  /**
   * Resolves a product's content for the given locale, falling back to `en`.
   */
  static localize(product: Product, locale: string): LocalizedProduct {
    const info =
      locale === "es" ? product.information.es : product.information.en;

    return {
      id: product.id,
      slug: product.slug,
      title: info.title,
      description: info.description,
      price: product.price,
      variant: product.variant,
      duration: product.duration,
    };
  }
}

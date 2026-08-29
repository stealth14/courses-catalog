import api from "@/utils/api";
import { Meta } from "@/interfaces/results";

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
 * Raw record shape of a product entry as returned by the Strapi v5 REST
 * API (flat entry: custom fields live at the same level as `id` /
 * `documentId`): custom `slug`, `variant`, `duration`, localized
 * `information`, `price` plus the standard `id`, `documentId`,
 * `createdAt`, `updatedAt`, `publishedAt`.
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
 * Query params accepted by {@link Product.search}. Forwarded to Strapi
 * as query-string parameters (pagination, filters, sort, locale, …).
 */
export type ProductSearchParams = {
  locale?: string;
  sort?: string | string[];
  pagination?: { page?: number; pageSize?: number };
  filters?: Record<string, unknown>;
  [key: string]: unknown;
};

/** Strapi v5 collection response for `GET /api/products?populate=*`. */
export type StrapiProductCollection = {
  data: ProductData[];
  meta?: Meta;
};

/** Strapi v5 single-entry response for `GET /api/products/:documentId`. */
export type StrapiProductSingle = {
  data: ProductData | null;
};

/**
 * Product model — the data layer for the Strapi `api::product.product`
 * content type (see `src/models/post.example.ts` for the template this
 * follows).
 *
 * The model is safe to import from client code (it only talks to
 * `api.public`); write operations are not offered here because they
 * require the server-side bearer token.
 */
export class Product {
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
   * Builds a Product from a raw Strapi v5 record, normalizing optional
   * fields that may be missing from the response.
   */
  static fromData(data: ProductData): Product {
    return new Product({
      ...data,
      information: data.information ?? {
        en: { title: "", description: "" },
        es: { title: "", description: "" },
      },
      duration: data.duration ?? null,
      publishedAt: data.publishedAt ?? null,
    });
  }

  /**
   * Lists products from Strapi.
   *
   * `populate=*` is always applied so relations/components come back
   * resolved; the caller cannot override it. Errors are re-thrown so
   * callers can surface them in the UI (e.g. via the `RequestError`
   * component) — there is NO local-data fallback.
   *
   * @param params Strapi query params (pagination, filters, sort, …).
   * @returns The products and their pagination meta.
   */
  static async search(
    params: ProductSearchParams = {}
  ): Promise<{ items: Product[]; meta: Meta }> {
    try {
      // populate=* covers everything — strip any caller-supplied value.
      const rest: Record<string, unknown> = { ...params };
      delete rest.populate;

      const response = await api.public.get<StrapiProductCollection>(
        "/products?populate=*",
        { params: rest }
      );

      const items = (response.data.data ?? []).map((entry) =>
        Product.fromData(entry)
      );

      return {
        items,
        meta: response.data.meta ?? Product.buildMeta(items),
      };
    } catch (error) {
      console.error("[Product.search]", error);
      throw error;
    }
  }

  /**
   * Finds one product by its Strapi `documentId` (the stable UUID — not
   * the numeric `id`, which can change between environments).
   *
   * @returns The product, or null when Strapi has no such entry.
   */
  static async findOne(documentId: string): Promise<Product | null> {
    try {
      const response = await api.public.get<StrapiProductSingle>(
        `/products/${documentId}?populate=*`
      );

      return response.data.data ? Product.fromData(response.data.data) : null;
    } catch (error) {
      console.error("[Product.findOne]", error);
      throw error;
    }
  }

  /**
   * Resolves a product's content for the given locale, falling back to
   * `en` and finally to empty strings for malformed records.
   */
  static localize(product: Product, locale: string): LocalizedProduct {
    const byLocale = product.information as Record<
      string,
      ProductInfo | undefined
    >;
    const info = byLocale[locale] ?? byLocale.en ?? { title: "", description: "" };

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

  /**
   * Builds pagination meta when the API response omits it, matching
   * Strapi's `meta.pagination` shape.
   */
  private static buildMeta(items: Product[]): Meta {
    return {
      pagination: {
        page: 1,
        pageSize: items.length,
        pageCount: 1,
        total: items.length,
      },
    };
  }
}

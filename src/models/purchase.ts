import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Enumerated values for the `paymentMethod` field
 * (Strapi v5 `enumeration` attribute).
 */
export enum PaymentMethod {
  USDT = "usdt",
  BTC = "btc",
  BINANCE = "binance",
  WHATSAPP = "whatsapp",
}

export type PurchaseData = {
  id: number;
  documentId: string;
  /** Strapi v5 enumeration field. */
  paymentMethod: PaymentMethod;
  /**
   * Strapi v4 relation (many-to-one, target `api::product.product`,
   * `inversedBy: "purchases"`): one purchase is related to one and only
   * one product record, while a product can be related to many purchase
   * records. Stores the related product's id.
   */
  product: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
};

/**
 * Purchase model. Declares the shape of a purchase record: a Strapi v5
 * enumeration field for the payment method and a Strapi v4 many-to-one
 * relation to a Product.
 */
export class Purchase {
  private static readonly FILE_PATH = path.join(
    process.cwd(),
    "data",
    "purchases.json"
  );

  readonly id: number;
  readonly documentId: string;
  /** Strapi v5 enumeration field. */
  readonly paymentMethod: PaymentMethod;
  /**
   * Strapi v4 relation (many-to-one): id of the related product record.
   * One purchase → one product; one product → many purchases.
   */
  readonly product: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedAt: string | null;

  constructor(data: PurchaseData) {
    this.id = data.id;
    this.documentId = data.documentId;
    this.paymentMethod = data.paymentMethod;
    this.product = data.product;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.publishedAt = data.publishedAt ?? null;
  }

  /**
   * Persists a new purchase record to the local JSON store
   * (`data/purchases.json`). Server-only.
   */
  static async create(input: {
    paymentMethod: PaymentMethod;
    product: number;
  }): Promise<Purchase> {
    const purchases = await Purchase.readAll();
    const now = new Date().toISOString();

    const purchase = new Purchase({
      id: purchases.reduce((max, item) => Math.max(max, item.id), 0) + 1,
      documentId: crypto.randomUUID(),
      paymentMethod: input.paymentMethod,
      product: input.product,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    });

    purchases.push(purchase);
    await writeFile(
      Purchase.FILE_PATH,
      JSON.stringify(
        purchases.map((item) => ({
          id: item.id,
          documentId: item.documentId,
          paymentMethod: item.paymentMethod,
          product: item.product,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          publishedAt: item.publishedAt,
        })),
        null,
        2
      ) + "\n"
    );

    return purchase;
  }

  private static async readAll(): Promise<Purchase[]> {
    try {
      const raw = await readFile(Purchase.FILE_PATH, "utf-8");
      const data = JSON.parse(raw) as PurchaseData[];
      return data.map((entry) => new Purchase(entry));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }
}

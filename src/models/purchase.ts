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
  /**
   * Strapi v4 relation (one-to-one, target `api::appointment.appointment`,
   * `inversedBy: "purchase"`): the appointment booked for this purchase.
   * Stores the related appointment's id.
   */
  appointment?: number | null;
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
  /** Strapi v4 relation (one-to-one): id of the booked appointment. */
  readonly appointment: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedAt: string | null;

  constructor(data: PurchaseData) {
    this.id = data.id;
    this.documentId = data.documentId;
    this.paymentMethod = data.paymentMethod;
    this.product = data.product;
    this.appointment = data.appointment ?? null;
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
    appointment?: number | null;
  }): Promise<Purchase> {
    const purchases = await Purchase.readAll();
    const now = new Date().toISOString();

    const purchase = new Purchase({
      id: purchases.reduce((max, item) => Math.max(max, item.id), 0) + 1,
      documentId: crypto.randomUUID(),
      paymentMethod: input.paymentMethod,
      product: input.product,
      appointment: input.appointment ?? null,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    });

    purchases.push(purchase);
    await Purchase.persist(purchases);

    return purchase;
  }

  /**
   * Finds a purchase record by its numeric id.
   */
  static async findById(id: number): Promise<Purchase | null> {
    const purchases = await Purchase.readAll();
    return purchases.find((item) => item.id === id) ?? null;
  }

  /**
   * Attaches a booked appointment (Strapi v4 one-to-one relation) to the
   * purchase record and persists the change.
   */
  static async addAppointment(
    purchaseId: number,
    appointmentId: number
  ): Promise<Purchase | null> {
    const purchases = await Purchase.readAll();
    const index = purchases.findIndex((item) => item.id === purchaseId);
    if (index === -1) return null;

    const current = purchases[index];
    const updated = new Purchase({
      id: current.id,
      documentId: current.documentId,
      paymentMethod: current.paymentMethod,
      product: current.product,
      appointment: appointmentId,
      createdAt: current.createdAt,
      updatedAt: new Date().toISOString(),
      publishedAt: current.publishedAt ?? undefined,
    });

    purchases[index] = updated;
    await Purchase.persist(purchases);
    return updated;
  }

  private static toJson(purchase: Purchase): PurchaseData {
    return {
      id: purchase.id,
      documentId: purchase.documentId,
      paymentMethod: purchase.paymentMethod,
      product: purchase.product,
      appointment: purchase.appointment,
      createdAt: purchase.createdAt,
      updatedAt: purchase.updatedAt,
      publishedAt: purchase.publishedAt,
    };
  }

  private static async persist(purchases: Purchase[]): Promise<void> {
    await writeFile(
      Purchase.FILE_PATH,
      JSON.stringify(purchases.map(Purchase.toJson), null, 2) + "\n"
    );
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

import api from "@/utils/api";

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
   * Stores the related appointment's numeric id or its `documentId`.
   */
  appointment?: number | string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
};

/** Minimal Strapi v5 create-response entry for `api::purchase.purchase`. */
type StrapiPurchaseEntry = {
  id: number;
  documentId: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
};

/** Strapi v5 single-entry response for `POST /api/purchases`. */
type StrapiPurchaseSingle = {
  data: StrapiPurchaseEntry | null;
};

/**
 * Purchase model. Declares the shape of a purchase record: a Strapi v5
 * enumeration field for the payment method and a Strapi v4 many-to-one
 * relation to a Product.
 */
export class Purchase {
  readonly id: number;
  readonly documentId: string;
  /** Strapi v5 enumeration field. */
  readonly paymentMethod: PaymentMethod;
  /**
   * Strapi v4 relation (many-to-one): id of the related product record.
   * One purchase → one product; one product → many purchases.
   */
  readonly product: number;
  /** Strapi v4 relation (one-to-one): id or documentId of the booked appointment. */
  readonly appointment: number | string | null;
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
   * Creates a purchase record in Strapi v5 (`api::purchase.purchase`),
   * connecting the related product and (optionally) appointment. No local
   * persistence — errors are re-thrown. Server-only.
   */
  static async create(input: {
    paymentMethod: PaymentMethod;
    product: number;
    appointment?: number | string | null;
  }): Promise<Purchase> {
    const data: Record<string, unknown> = {
      paymentMethod: input.paymentMethod,
      product: { connect: [input.product] },
    };
    if (input.appointment != null) {
      const appointmentRef =
        typeof input.appointment === "number"
          ? input.appointment
          : { documentId: input.appointment };
      data.appointment = { connect: [appointmentRef] };
    }

    const response = await api.public.post<StrapiPurchaseSingle>(
      "/purchases",
      { data }
    );

    const entry = response.data.data;
    if (!entry) {
      throw new Error("Strapi did not return the created purchase.");
    }

    const now = new Date().toISOString();

    return new Purchase({
      id: entry.id,
      documentId: entry.documentId,
      paymentMethod: input.paymentMethod,
      product: input.product,
      appointment: input.appointment ?? null,
      createdAt: entry.createdAt ?? now,
      updatedAt: entry.updatedAt ?? now,
      publishedAt: entry.publishedAt ?? null,
    });
  }
}

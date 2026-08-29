import api from "@/utils/api";
import { Meta } from "@/interfaces/results";

export type AppointmentData = {
  id: number;
  documentId: string;
  /** Strapi v5 `date` field (YYYY-MM-DD). */
  date: string;
  /** Strapi v5 `time` fields (24h, HH:mm). */
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
};

/**
 * Query params accepted by {@link Appointment.search}. Forwarded to
 * Strapi as query-string parameters (pagination, filters, sort, …).
 */
export type AppointmentSearchParams = {
  locale?: string;
  sort?: string | string[];
  pagination?: { page?: number; pageSize?: number };
  filters?: Record<string, unknown>;
  [key: string]: unknown;
};

/** Strapi v5 response entry for `api::appointment.appointment`. */
type StrapiAppointmentEntry = {
  id: number;
  documentId: string;
  date: string;
  startTime: string;
  endTime: string;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
};

/** Strapi v5 single-entry response for `POST /api/appointments`. */
type StrapiAppointmentSingle = {
  data: StrapiAppointmentEntry | null;
};

/** Strapi v5 collection response for `GET /api/appointments`. */
type StrapiAppointmentCollection = {
  data: StrapiAppointmentEntry[];
  meta?: Meta;
};

/**
 * Appointment model. Stores the date/time interval selected by a
 * customer in Strapi v5 (`api::appointment.appointment`, `date` and
 * `time` attribute types). Writes (`create`) are server-only; reads
 * (`search`) are client-safe. There is no local persistence.
 */
export class Appointment {
  readonly id: number;
  readonly documentId: string;
  /** Selected day (YYYY-MM-DD). */
  readonly date: string;
  /** Interval start (HH:mm). */
  readonly startTime: string;
  /** Interval end (HH:mm). */
  readonly endTime: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedAt: string | null;

  constructor(data: AppointmentData) {
    this.id = data.id;
    this.documentId = data.documentId;
    this.date = data.date;
    this.startTime = data.startTime;
    this.endTime = data.endTime;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.publishedAt = data.publishedAt ?? null;
  }

  /**
   * Creates the appointment record in Strapi v5
   * (`POST /api/appointments`). There is no local persistence: on the
   * appointment screen the selection only lives in the zustand booking
   * store, and this record is created together with the purchase when
   * the customer continues on WhatsApp. Server-only.
   */
  static async create(input: {
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<Appointment> {
    const response = await api.public.post<StrapiAppointmentSingle>(
      "/appointments",
      {
        data: {
          date: input.date,
          startTime: input.startTime,
          endTime: input.endTime,
        },
      }
    );

    const entry = response.data.data;
    if (!entry) {
      throw new Error("Strapi did not return the created appointment.");
    }

    return Appointment.fromData(entry);
  }

  /**
   * Lists appointments from Strapi.
   *
   * `populate=*` is always applied so relations/components come back
   * resolved; the caller cannot override it. Errors are re-thrown so
   * callers can surface them in the UI — there is no local-data
   * fallback.
   *
   * @param params Strapi query params (pagination, filters, sort, …).
   * @returns The appointments and their pagination meta.
   */
  static async search(
    params: AppointmentSearchParams = {}
  ): Promise<{ items: Appointment[]; meta: Meta }> {
    try {
      // populate=* covers everything — strip any caller-supplied value.
      const rest: Record<string, unknown> = { ...params };
      delete rest.populate;

      const response = await api.public.get<StrapiAppointmentCollection>(
        "/appointments?populate=*",
        { params: rest }
      );

      const items = (response.data.data ?? []).map((entry) =>
        Appointment.fromData(entry)
      );

      return {
        items,
        meta: response.data.meta ?? Appointment.buildMeta(items),
      };
    } catch (error) {
      console.error("[Appointment.search]", error);
      throw error;
    }
  }

  /**
   * Builds pagination meta when the API response omits it, matching
   * Strapi's `meta.pagination` shape.
   */
  private static buildMeta(items: Appointment[]): Meta {
    return {
      pagination: {
        page: 1,
        pageSize: items.length,
        pageCount: 1,
        total: items.length,
      },
    };
  }

  /** Normalizes a raw Strapi v5 entry into an Appointment. */
  private static fromData(data: StrapiAppointmentEntry): Appointment {
    const now = new Date().toISOString();

    return new Appointment({
      id: data.id,
      documentId: data.documentId,
      date: data.date.slice(0, 10),
      startTime: data.startTime.slice(0, 5),
      endTime: data.endTime.slice(0, 5),
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
      publishedAt: data.publishedAt ?? null,
    });
  }
}

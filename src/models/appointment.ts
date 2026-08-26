import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

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
 * Appointment model. Stores the date/time interval selected by a
 * customer. Prepared to be stored in Strapi later (`date` and `time`
 * attribute types); for now it persists locally to
 * `data/appointments.json`.
 */
export class Appointment {
  private static readonly FILE_PATH = path.join(
    process.cwd(),
    "data",
    "appointments.json"
  );

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
   * Persists a new appointment record to the local JSON store
   * (`data/appointments.json`). Server-only.
   */
  static async create(input: {
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<Appointment> {
    const appointments = await Appointment.readAll();
    const now = new Date().toISOString();

    const appointment = new Appointment({
      id: appointments.reduce((max, item) => Math.max(max, item.id), 0) + 1,
      documentId: crypto.randomUUID(),
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
    });

    appointments.push(appointment);
    await Appointment.persist(appointments);

    return appointment;
  }

  /**
   * Finds an appointment record by its numeric id.
   */
  static async findById(id: number): Promise<Appointment | null> {
    const appointments = await Appointment.readAll();
    return appointments.find((item) => item.id === id) ?? null;
  }

  private static toJson(appointment: Appointment): AppointmentData {
    return {
      id: appointment.id,
      documentId: appointment.documentId,
      date: appointment.date,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      publishedAt: appointment.publishedAt,
    };
  }

  private static async persist(appointments: Appointment[]): Promise<void> {
    await writeFile(
      Appointment.FILE_PATH,
      JSON.stringify(appointments.map(Appointment.toJson), null, 2) + "\n"
    );
  }

  private static async readAll(): Promise<Appointment[]> {
    try {
      const raw = await readFile(Appointment.FILE_PATH, "utf-8");
      const data = JSON.parse(raw) as AppointmentData[];
      return data.map((entry) => new Appointment(entry));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }
}

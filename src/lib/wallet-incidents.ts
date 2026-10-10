import { readFile } from "node:fs/promises";
import path from "node:path";

/** The locales a text can be written in. */
const LOCALES = ["en", "es"] as const;

export type Locale = (typeof LOCALES)[number];

/** A text that may exist in one, both or neither locale. */
export type LocalizedText = Partial<Record<Locale, string>>;

/** Paragraph list that may exist in one, both or neither locale. */
export type LocalizedParagraphs = Partial<Record<Locale, string[]>>;

/**
 * One documented failure of a wallet. Every field is optional in the data
 * file: an incident can be registered before its copy is written, and the
 * wiki fills the gaps with placeholders instead of rendering nothing.
 */
export type WalletIncident = {
  date: LocalizedText | null;
  /** Where the claim comes from — vendor advisory, lab write-up, press. */
  source: string | null;
  summary: LocalizedText | null;
  /** Extra paragraphs shown inside the wiki entry, under the summary. */
  details: LocalizedParagraphs | null;
};

/** An outbound reference backing a claim. */
export type WalletSource = {
  label: string;
  url: string;
};

/**
 * What still puts a wallet at risk today, as opposed to what happened to it
 * once: unpatched chip families, missing secure elements, closed firmware.
 * Rendered as its own block, because a standing weakness is not an incident.
 */
export type WalletExposure = {
  summary: LocalizedText | null;
  points: LocalizedParagraphs | null;
  sources: WalletSource[];
};

/** A wallet the site documents, as read from `public/wallet-incidents.json`. */
export type WalletRecord = {
  /** URL segment on `/wiki/<id>` and the asset file stem in `public`. */
  id: string;
  name: string;
  monogram: string;
  incidents: WalletIncident[];
  exposure: WalletExposure | null;
  /** The wallet's own article, written once its copy is ready. */
  article: LocalizedParagraphs | null;
};

const FILE_PATH = path.join(process.cwd(), "public", "wallet-incidents.json");

/**
 * Reads the documented incidents from `public/wallet-incidents.json`.
 *
 * The file is the single source of truth for both the landing-page row and
 * the wallet wiki: add a wallet (or another incident for one already
 * listed) there and both surfaces pick it up on the next request, with no
 * code change. Structure errors throw — a typo in an `id` would silently
 * move a page — but missing *copy* is legitimate and becomes `null`, which
 * the UI renders as a placeholder.
 *
 * Server-only. `id` is used as a route segment, so it must be URL-safe.
 */
export async function getWallets(): Promise<WalletRecord[]> {
  const raw = await readFile(FILE_PATH, "utf-8");
  const data = JSON.parse(raw) as { wallets?: unknown };

  if (!Array.isArray(data.wallets)) {
    throw new Error(
      'Invalid public/wallet-incidents.json: "wallets" must be an array.'
    );
  }

  return data.wallets.map((entry, index) => parseWallet(entry, index));
}

function parseWallet(entry: unknown, index: number): WalletRecord {
  const wallet = (entry ?? {}) as Record<string, unknown>;
  const where = `wallets[${index}]`;

  const id = requireString(wallet.id, `${where}.id`);
  const name = requireString(wallet.name, `${where}.name`);
  const monogram = requireString(wallet.monogram, `${where}.monogram`);

  if (!/^[a-z0-9-]+$/.test(id)) {
    throw new Error(
      `Invalid public/wallet-incidents.json: ${where}.id must be lowercase letters, digits or dashes (it is part of the /wiki URL).`
    );
  }

  const incidents = wallet.incidents ?? [];

  if (!Array.isArray(incidents)) {
    throw new Error(
      `Invalid public/wallet-incidents.json: ${where}.incidents must be an array.`
    );
  }

  return {
    id,
    name,
    monogram,
    incidents: incidents.map((incident, incidentIndex) =>
      parseIncident(incident, `${where}.incidents[${incidentIndex}]`)
    ),
    exposure: parseExposure(wallet.exposure, `${where}.exposure`),
    article: parseParagraphs(wallet.article),
  };
}

function parseExposure(entry: unknown, where: string): WalletExposure | null {
  if (entry === undefined || entry === null) return null;

  if (typeof entry !== "object" || Array.isArray(entry)) {
    throw new Error(
      `Invalid public/wallet-incidents.json: ${where} must be an object.`
    );
  }

  const exposure = entry as Record<string, unknown>;
  const sources = exposure.sources ?? [];

  if (!Array.isArray(sources)) {
    throw new Error(
      `Invalid public/wallet-incidents.json: ${where}.sources must be an array of { label, url }.`
    );
  }

  const parsed: WalletExposure = {
    summary: parseText(exposure.summary),
    points: parseParagraphs(exposure.points),
    sources: sources.map((source, sourceIndex) => {
      const item = (source ?? {}) as Record<string, unknown>;

      return {
        label: requireString(item.label, `${where}.sources[${sourceIndex}].label`),
        url: parseUrl(item.url, `${where}.sources[${sourceIndex}].url`, true) as string,
      };
    }),
  };

  const isEmpty =
    parsed.summary === null &&
    parsed.points === null &&
    parsed.sources.length === 0;

  return isEmpty ? null : parsed;
}

function parseIncident(entry: unknown, where: string): WalletIncident {
  const incident = (entry ?? {}) as Record<string, unknown>;

  return {
    date: parseText(incident.date),
    source: parseUrl(incident.source, `${where}.source`, false),
    summary: parseText(incident.summary),
    details: parseParagraphs(incident.details),
  };
}

function requireString(value: unknown, where: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(
      `Invalid public/wallet-incidents.json: ${where} must be a non-empty string.`
    );
  }

  return value.trim();
}

/** Optional links are rendered as outbound sources, so https only. */
function parseUrl(
  value: unknown,
  where: string,
  required: boolean
): string | null {
  if (value === undefined || value === null || value === "") {
    if (required) {
      throw new Error(
        `Invalid public/wallet-incidents.json: ${where} is required and must be an https URL.`
      );
    }

    return null;
  }

  if (typeof value !== "string" || !/^https:\/\/\S+$/.test(value.trim())) {
    throw new Error(
      `Invalid public/wallet-incidents.json: ${where} must be an https URL.`
    );
  }

  return value.trim();
}

function parseText(value: unknown): LocalizedText | null {
  if (value === undefined || value === null) return null;

  if (typeof value === "string") {
    // Shorthand: one language, shown to every locale.
    return value.trim() === "" ? null : { en: value.trim() };
  }

  if (typeof value !== "object") {
    throw new Error(
      "Invalid public/wallet-incidents.json: localized text must be a string or an { en, es } object."
    );
  }

  const record = value as Record<string, unknown>;
  const text: LocalizedText = {};

  for (const locale of LOCALES) {
    const candidate = record[locale];
    if (typeof candidate === "string" && candidate.trim() !== "") {
      text[locale] = candidate.trim();
    }
  }

  return Object.keys(text).length > 0 ? text : null;
}

function parseParagraphs(value: unknown): LocalizedParagraphs | null {
  if (value === undefined || value === null) return null;

  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error(
      "Invalid public/wallet-incidents.json: paragraphs must be an { en, es } object of string arrays."
    );
  }

  const record = value as Record<string, unknown>;
  const paragraphs: LocalizedParagraphs = {};

  for (const locale of LOCALES) {
    const candidate = record[locale];
    if (!Array.isArray(candidate)) continue;

    const list = candidate
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    if (list.length > 0) paragraphs[locale] = list;
  }

  return Object.keys(paragraphs).length > 0 ? paragraphs : null;
}

/**
 * Picks the text for `locale`, falling back to whichever locale does have
 * it: a reader is better served by the other language than by a gap while
 * a translation is pending. Returns `null` when nothing is written yet, so
 * callers can show their placeholder.
 */
export function localizedText(
  text: LocalizedText | null,
  locale: string
): string | null {
  return pick(text, locale);
}

/** Same fallback rule as {@link localizedText}, for paragraph lists. */
export function localizedParagraphs(
  paragraphs: LocalizedParagraphs | null,
  locale: string
): string[] | null {
  return pick(paragraphs, locale);
}

function pick<T>(
  values: Partial<Record<Locale, T>> | null,
  locale: string
): T | null {
  if (!values) return null;

  const exact = values[locale as Locale];
  if (exact !== undefined) return exact;

  for (const candidate of Object.values(values)) {
    if (candidate !== undefined) return candidate;
  }

  return null;
}

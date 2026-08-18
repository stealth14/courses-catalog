import { readFile } from "node:fs/promises";
import path from "node:path";

type ProfileTitlesData = {
  titles: Record<string, string[]>;
};

const FILE_PATH = path.join(process.cwd(), "public", "profile-titles.json");

/**
 * Reads the profile titles for the given locale from
 * `public/profile-titles.json`. Falls back to the `en` titles
 * when the requested locale is not present.
 * Server-only: must only be called from server components.
 */
export async function getProfileTitles(locale: string): Promise<string[]> {
  const raw = await readFile(FILE_PATH, "utf-8");
  const data = JSON.parse(raw) as Partial<ProfileTitlesData>;

  const titles = data.titles;
  if (!titles || typeof titles !== "object") {
    throw new Error(
      'Invalid public/profile-titles.json: expected { "titles": { "<locale>": [string, ...] } }'
    );
  }

  const localized = titles[locale] ?? titles.en ?? [];
  return Array.isArray(localized)
    ? localized.filter((title): title is string => typeof title === "string")
    : [];
}

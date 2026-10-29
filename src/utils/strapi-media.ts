import type { StrapiMedia } from "@/interfaces/strapi-media";

/** Strapi media are served from the CMS origin, without the trailing slash. */
const CMS_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

/**
 * Resolves a Strapi media file to an absolute URL, which is what
 * `next/image` requires. Strapi returns paths relative to its own origin
 * (e.g. `/uploads/post.png`), so they are prefixed with the CMS URL.
 *
 * @returns The absolute URL, or null when the media has no file.
 */
export function resolveStrapiMediaUrl(
  media: StrapiMedia | null | undefined
): string | null {
  if (!media?.url) return null;

  if (/^https?:\/\//i.test(media.url)) return media.url;

  const path = media.url.startsWith("/") ? media.url : `/${media.url}`;
  return `${CMS_URL}${path}`;
}

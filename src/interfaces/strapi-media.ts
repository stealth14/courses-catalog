// ── Strapi v5 media types ──────────────────────────────────────────

/** Strapi v5 responsive image format (thumbnail, small, medium, large, etc.). */
export interface StrapiMediaFormat {
    name: string;
    hash: string;
    ext: string;
    mime: string;
    width: number;
    height: number;
    size: number;
    sizeInBytes: number;
    url: string;
    path: string | null;
}

/** Strapi v5 media file — populated flat shape (no data/attributes wrapper). */
export interface StrapiMedia {
    id: number;
    documentId: string;
    name: string;
    alternativeText: string | null;
    caption: string | null;
    focalPoint: string | null;
    width: number | null;
    height: number | null;
    formats: Record<string, StrapiMediaFormat> | null;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    provider_metadata: unknown;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

/** Strapi v5 media data node (non-populated — id + attributes wrapper). */
export interface StrapiMediaData {
    id: number;
    attributes: Omit<StrapiMedia, 'id' | 'documentId'>;
}

/** Strapi v5 single-media envelope (non-populated). */
export interface StrapiSingleMedia {
    data: StrapiMediaData | null;
}

/** Strapi v5 multi-media envelope (non-populated). */
export interface StrapiMultiMedia {
    data: StrapiMediaData[];
}

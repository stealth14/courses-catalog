// ── Strapi v5 REST API generic response types ────────────────────────

// ── Success shapes ──────────────────────────────────────────────────

/** Strapi v5 single-entity success envelope. */
export interface StrapiSingleResponse<T> {
    data: {
        id: number;
        attributes: T;
    };
    meta?: Record<string, unknown>;
}

// ── Error shapes ────────────────────────────────────────────────────

/** A single per-field validation error from Strapi v5. */
export interface StrapiValidationError {
    path: string[];
    message: string;
    name: string;
}

/** Strapi v5 error body. */
export interface StrapiErrorBody {
    status: number;
    name: string;
    message: string;
    details?: {
        errors: StrapiValidationError[];
    };
}

/** Strapi v5 error response shape. */
export interface StrapiErrorResponse {
    data: null;
    error: StrapiErrorBody;
}

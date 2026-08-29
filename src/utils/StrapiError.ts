// ── Strapi v5 REST API error helpers (renderer / axios edition) ─────

import { isAxiosError } from 'axios';

// ── Strapi error type declarations ──────────────────────────────────

/** A single per-field validation error from Strapi v5. */
export interface StrapiValidationError {
    path: string[];
    message: string;
    name: string;
}

/** Strapi v5 error body returned on a failed request. */
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

// ── StrapiError class ───────────────────────────────────────────────

/**
 * Static helpers for extracting error messages from Strapi v5
 * responses received via axios (used by model classes like Post).
 */
export default class StrapiError {
    /**
     * Extract a clean, faithful error message from a failed axios error.
     *
     * Accepts any error but only returns a message for well-formed
     * {@link StrapiAxiosError} instances.  Returns `null` for network
     * errors, cancellations, or non-axios exceptions.
     *
     * @param err - The error thrown by axios on a non-2xx response.
     * @returns The Strapi error message, or a fallback, or null.
     */
    static parse(err: unknown): string | null {
        if (!isAxiosError(err)) return null;

        const status = err.response?.status;
        if (status == null) return null;

        const body = err.response?.data as StrapiErrorResponse | undefined;
        if (body?.error?.message) {
            return body.error.message;
        }
        return `HTTP ${status}`;
    }
}

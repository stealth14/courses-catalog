"use client";

import { isAxiosError } from "axios";
import StrapiError from "@/utils/StrapiError";

/**
 * Extracts displayable details from a failed request:
 *   - a badge (HTTP status when the server answered, the axios network
 *     code otherwise) and
 *   - a human-readable message (Strapi's error message when available,
 *     otherwise the transport error message).
 */
function describeRequestError(error: unknown): {
  badge: string | null;
  message: string;
} {
  if (isAxiosError(error)) {
    // The server answered with a non-2xx response.
    if (error.response) {
      return {
        badge: `HTTP ${error.response.status}`,
        message: StrapiError.parse(error) ?? error.message,
      };
    }

    // Network-level failure (server unreachable, CORS, timeout, …).
    return {
      badge: error.code ?? null,
      message: error.message,
    };
  }

  if (error instanceof Error) {
    return { badge: null, message: error.message };
  }

  return { badge: null, message: String(error) };
}

/**
 * Error panel that accurately describes a failed API request: a badge
 * with the HTTP status / network code plus the server's or transport's
 * message. Render it whenever a data hook reports `status === "error"`.
 */
export function RequestError({
  error,
  title,
  retryLabel,
  onRetry,
}: {
  /** The error stored in the hook's "error" state. */
  error: unknown;
  /** Localized heading for the panel. */
  title: string;
  /** Localized label for the optional retry button. */
  retryLabel?: string;
  /** Optional retry action — usually the hook's `refresh()`. */
  onRetry?: () => Promise<void> | void;
}) {
  const { badge, message } = describeRequestError(error);

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-center dark:border-red-950 dark:bg-red-950/20"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400">
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      </span>

      <p className="text-sm font-semibold text-red-700 dark:text-red-400">
        {title}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {badge ? (
          <span className="rounded-full bg-red-100 px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-red-700 dark:bg-red-950/60 dark:text-red-300">
            {badge}
          </span>
        ) : null}
        <span className="text-xs leading-5 text-zinc-600 dark:text-zinc-400">
          {message}
        </span>
      </div>

      {onRetry && retryLabel ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-1 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}

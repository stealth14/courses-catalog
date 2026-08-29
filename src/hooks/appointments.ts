import { useCallback, useEffect, useState } from "react";

import Results, { Dataset } from "@/interfaces/results";
import { Appointment } from "@/models/appointment";

/**
 * Stable default params so `useAppointments()` without arguments does
 * not refetch on every render (the object identity never changes).
 * Fetches the first 100 appointments (the created booking records used
 * to mark occupied slots in the calendar).
 */
const DEFAULT_PARAMS: Record<string, unknown> = Object.freeze({
  pagination: Object.freeze({ pageSize: 100 }),
});

/**
 * Collection data hook for the Appointment model — mirrors the
 * `products.ts` hook.
 *
 * Lists appointments from Strapi (see {@link Appointment.search}) and
 * exposes them as a `Dataset<Appointment>` with the standard
 * discriminated-union statuses ("loading" | "success" | "error" |
 * "not-found").
 *
 * NOTE: pass a STABLE params reference (a constant or memoized object) —
 * the fetch re-runs whenever the reference changes.
 *
 * @param params Strapi v5 query params (pagination, filters, sort, …).
 * @returns The current request state plus a `refresh()` re-fetch action.
 */
export default function useAppointments(
  params: Record<string, unknown> = DEFAULT_PARAMS
): Dataset<Appointment> {
  // Discriminated union holding the current request state. Starts in
  // "loading" because the hook fetches on mount.
  const [result, setResult] = useState<Results<Appointment>>({
    status: "loading",
  });

  // Fetch on mount and whenever params change. State is only updated
  // from promise callbacks (never synchronously inside the effect), and
  // the `cancelled` flag guards against updates after unmount.
  useEffect(() => {
    let cancelled = false;

    Appointment.search(params)
      .then(({ items, meta }) => {
        if (!cancelled) setResult({ items, meta, status: "success" });
      })
      .catch((error) => {
        if (!cancelled) setResult({ status: "error", error });
      });

    return () => {
      cancelled = true;
    };
  }, [params]);

  // Manual re-fetch exposed to consumers (event handlers only — never
  // called from an effect).
  const refresh = useCallback(async () => {
    try {
      const { items, meta } = await Appointment.search(params);
      setResult({ items, meta, status: "success" });
    } catch (error) {
      setResult({ status: "error", error });
    }
  }, [params]);

  // Spread the state and attach the refresh action.
  return {
    ...result,
    refresh,
  } as Dataset<Appointment>;
}

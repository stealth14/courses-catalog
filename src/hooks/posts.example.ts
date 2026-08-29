// ═════════════════════════════════════════════════════════════════════
//  EXAMPLE ONLY — DO NOT IMPORT THIS FILE INTO PRODUCTION CODE.
//
//  This file is the reference template for COLLECTION data hooks.
//  To create a real hook for a model (e.g. Product):
//
//    1. Copy this file to `src/hooks/<name>.ts` (e.g. `products.ts`).
//    2. Replace `Post.search` with your model's own listing method.
//    3. Delete this header and the `.example` suffix.
//
//  How collection hooks work in this project:
//    · Each hook owns a `useState<Results<T>>` — the collection variant
//      of the state union (`src/interfaces/results.ts`):
//        - "idle"      — initial state, nothing requested yet
//        - "loading"   — first fetch in flight
//        - "success"   — data available (`items` + pagination `meta`)
//        - "error"     — request failed (`error`)
//        - "not-found" — request succeeded but there is no record
//    · `params` is forwarded to the model's `search()` (Strapi query
//      params: pagination, filters, sort, …).
//    · The memoization key is `JSON.stringify(params)` so the fetch only
//      re-runs when the serialized params actually change — object
//      identities alone must not retrigger requests.
//    · The returned `Dataset<T>` adds a `refresh()` action so components
//      can re-run the fetch manually.
//    · Components decide what to render from `status`, e.g.:
//        status === "loading"  → skeleton / spinner
//        status === "error"    → error message + retry (refresh)
//        status === "success"  → items.map(...)
// ═════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";

import Results, { Dataset } from "@/interfaces/results";
import Post from "@/models/post.example";


/**
 * Stable default params — pass a constant or memoized object as
 * `params`; the fetch re-runs whenever the reference changes.
 */
const EMPTY_PARAMS: Record<string, unknown> = Object.freeze({});

/**
 * Lists Posts with the given Strapi query params and exposes the result
 * as a `Dataset`.
 *
 * @param params Strapi v5 query params (pagination, filters, sort, …).
 * @returns The current request state plus a `refresh()` re-fetch action.
 */
export default function usePosts(params: Record<string, unknown> = EMPTY_PARAMS): Dataset<Post> {

    // Discriminated union holding the current request state. Starts in
    // "loading" because the hook fetches on mount.
    const [result, setResult] = useState<Results<Post>>({ status: "loading" });

    // Fetch on mount and whenever params change. State is only updated
    // from promise callbacks (never synchronously inside the effect),
    // and the `cancelled` flag guards against updates after unmount.
    useEffect(() => {
        let cancelled = false;

        Post.search(params)
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
            const { items, meta } = await Post.search(params);
            setResult({ items, meta, status: "success" });
        } catch (error) {
            setResult({ status: "error", error });
        }
    }, [params]);

    // Spread the state and attach the refresh action.
    return {
        ...result,
        refresh,
    } as Dataset<Post>;

}
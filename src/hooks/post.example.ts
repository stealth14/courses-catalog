// ═════════════════════════════════════════════════════════════════════
//  EXAMPLE ONLY — DO NOT IMPORT THIS FILE INTO PRODUCTION CODE.
//
//  This file is the reference template for SINGLE-ENTITY data hooks.
//  To create a real hook for a model (e.g. Product):
//
//    1. Copy this file to `src/hooks/<name>.ts` (e.g. `product.ts`).
//    2. Replace `Post.findOne` with your model's own lookup method.
//    3. Delete this header and the `.example` suffix.
//
//  How data hooks work in this project:
//    · Each hook owns a `useState<Result<T>>` with a discriminated union
//      of request states (`src/interfaces/result.ts`):
//        - "idle"       — initial state, nothing requested yet
//        - "loading"    — first fetch in flight
//        - "success"    — data available (`item`)
//        - "error"      — request failed (`error`)
//        - "not-found"  — request succeeded but there is no record
//        - "refreshing" — a background re-fetch (keeps the old `item`)
//    · The returned `Dataset<T>` adds a `refresh()` action so components
//      can re-run the fetch manually.
//    · `fetch` is memoized with `useCallback` on its inputs and invoked
//      exactly once via `useEffect` — re-running only when the inputs
//      change.
//    · Components decide what to render from `status`, e.g.:
//        status === "loading"  → skeleton / spinner
//        status === "error"    → error message + retry (refresh)
//        status === "success"  → the item
// ═════════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useState } from "react";

import Post from "@/models/post.example";
import Result, { Dataset } from "@/interfaces/result";


/**
 * Fetches a single Post by `documentId` and exposes it as a `Dataset`.
 *
 * @param documentId Strapi v5 documentId of the entity to load.
 * @returns The current request state plus a `refresh()` re-fetch action.
 */
export default function usePost(documentId: string): Dataset<Post> {
    // Discriminated union holding the current request state. Starts in
    // "loading" because the hook fetches on mount.
    const [result, setResult] = useState<Result<Post>>({ status: "loading" });

    // Fetch on mount and whenever the documentId changes. State is only
    // updated from promise callbacks (never synchronously inside the
    // effect), and the `cancelled` flag guards against updates after
    // unmount.
    useEffect(() => {
        let cancelled = false;

        Post.findOne(documentId)
            .then((post) => {
                if (!cancelled) {
                    setResult(post
                        ? { status: "success", item: post }
                        : { status: "not-found" },
                    );
                }
            })
            .catch((error) => {
                if (!cancelled) setResult({ status: "error", error });
            });

        return () => {
            cancelled = true;
        };
    }, [documentId]);

    // Manual re-fetch exposed to consumers (event handlers only — never
    // called from an effect): keeps the previous item visible while the
    // request is in flight ("refreshing" state).
    const refresh = useCallback(async () => {
        setResult(prev => ({ ...prev, status: "refreshing" }));

        try {
            const post = await Post.findOne(documentId);
            setResult(post
                ? { status: "success", item: post }
                : { status: "not-found" },
            );
        } catch (error) {
            setResult({ status: "error", error });
        }
    }, [documentId]);

    // Spread the state and attach the refresh action.
    return { ...result, refresh } as Dataset<Post>;
}

import { useCallback, useEffect, useState } from "react";

import { Product } from "@/models/product";
import Result, { Dataset } from "@/interfaces/result";

/**
 * Single-entity data hook for the Product model — live implementation of
 * the `post.example.ts` template.
 *
 * Fetches one product by its Strapi `documentId` and exposes it as a
 * `Dataset<Product>`.
 *
 * @param documentId Strapi v5 documentId of the product to load.
 * @returns The current request state plus a `refresh()` re-fetch action.
 */
export default function useProduct(documentId: string): Dataset<Product> {
  // Discriminated union holding the current request state. Starts in
  // "loading" because the hook fetches on mount.
  const [result, setResult] = useState<Result<Product>>({ status: "loading" });

  // Fetch on mount and whenever the documentId changes. State is only
  // updated from promise callbacks (never synchronously inside the
  // effect), and the `cancelled` flag guards against updates after
  // unmount.
  useEffect(() => {
    let cancelled = false;

    Product.findOne(documentId)
      .then((product) => {
        if (!cancelled) {
          setResult(
            product
              ? { status: "success", item: product }
              : { status: "not-found" }
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
    setResult((prev) => ({ ...prev, status: "refreshing" }));

    try {
      const product = await Product.findOne(documentId);
      setResult(
        product
          ? { status: "success", item: product }
          : { status: "not-found" }
      );
    } catch (error) {
      setResult({ status: "error", error });
    }
  }, [documentId]);

  // Spread the state and attach the refresh action.
  return { ...result, refresh } as Dataset<Product>;
}

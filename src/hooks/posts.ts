import { useCallback, useEffect, useState } from "react";

import Results, { Dataset } from "@/interfaces/results";
import { Post } from "@/models/post";

/** Stable params so the fixture collection is fetched once on mount. */
const DEFAULT_PARAMS: Record<string, unknown> = Object.freeze({});

/**
 * Collection hook for posts. Uses the standard `Dataset<Post>` request
 * states and refresh action used by the other collection hooks.
 */
export default function usePosts(
  params: Record<string, unknown> = DEFAULT_PARAMS
): Dataset<Post> {
  const [result, setResult] = useState<Results<Post>>({ status: "loading" });

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

  const refresh = useCallback(async () => {
    setResult({ status: "loading" });
    try {
      const { items, meta } = await Post.search(params);
      setResult({ items, meta, status: "success" });
    } catch (error) {
      setResult({ status: "error", error });
    }
  }, [params]);

  return {
    ...result,
    refresh,
  } as Dataset<Post>;
}

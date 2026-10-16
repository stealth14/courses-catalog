"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useLocale } from "next-intl";
import usePosts from "@/hooks/posts";
import { Link } from "@/i18n/navigation";
import { Post } from "@/models/post";
import { usePostCache } from "./post-cache-provider";

export function RecommendedPosts({
  loadingText,
  errorText,
}: {
  loadingText: string;
  errorText: string;
}) {
  const locale = useLocale();
  const { setPosts } = usePostCache();
  const result = usePosts();

  useEffect(() => {
    if (result.status === "success") setPosts(result.items);
  }, [result, setPosts]);

  return (
    <section className="flex flex-col gap-4">
      {result.status === "error" ? (
        <p role="alert" className="text-sm text-red-700 dark:text-red-300">
          {errorText}
          {result.error instanceof Error ? `: ${result.error.message}` : ""}
        </p>
      ) : result.status !== "success" ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {loadingText}
        </p>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-3">
          {result.items.map((post) => {
            const localized = Post.localize(post, locale);

            return (
              <li key={post.documentId}>
                <Link
                  href={`/academy/${post.slug}`}
                  aria-label={localized.title}
                  className="group relative block aspect-[3/2] overflow-hidden bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground dark:bg-zinc-900"
                >
                  <Image
                    src={post.thumbnail.url}
                    alt={post.thumbnail.alternativeText ?? ""}
                    fill
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover transition-transform group-hover:scale-[1.03]"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent"
                  />
                  <span className="absolute inset-x-0 bottom-0 p-4 text-sm font-semibold text-white">
                    {localized.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

"use client";

import { useLocale } from "next-intl";
import { Post, type PostData } from "@/models/post";
import { usePostCache } from "./post-cache-provider";

export function AcademyPostPage({
  slug,
  initialPost,
}: {
  slug: string;
  initialPost: PostData;
}) {
  const locale = useLocale();
  const { posts } = usePostCache();
  const cachedPost: Post | undefined = posts?.find(
    (entry) => entry.slug === slug
  );
  const post = cachedPost ?? initialPost;
  const localized = Post.localize(post, locale);

  return (
    <main className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <article className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-4 px-4 pt-10 pb-10 sm:px-6 sm:pt-16 sm:pb-16">
        <h1 className="max-w-3xl text-balance text-3xl font-semibold tracking-tight text-black sm:text-4xl dark:text-zinc-50">
          {localized.title}
        </h1>
        <p className="max-w-2xl text-pretty text-base leading-7 text-zinc-600 dark:text-zinc-400">
          {localized.description}
        </p>
      </article>
    </main>
  );
}

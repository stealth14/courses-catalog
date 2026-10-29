import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AcademyPostPage } from "@/components/academy-post-page";
import { Post } from "@/models/post";

/** Memoized per request so `generateMetadata` and the page share one query. */
const findPost = cache((slug: string) => Post.findBySlug(slug));

export async function generateMetadata(
  props: { params: Promise<{ locale: string; slug: string }> }
): Promise<Metadata> {
  const { locale, slug } = await props.params;
  const post = await findPost(slug);

  if (!post) return {};

  const localized = Post.localize(post, locale);
  return { title: localized.title, description: localized.description };
}

export default async function AcademyPostRoute(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;
  const post = await findPost(slug);

  if (!post) notFound();

  return <AcademyPostPage slug={slug} initialPost={{ ...post }} />;
}

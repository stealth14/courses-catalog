import type { Metadata } from "next";
import { notFound } from "next/navigation";
import postRecords from "../../../../../public/posts.json";
import { AcademyPostPage } from "@/components/academy-post-page";
import { Post, type StrapiPostCollection } from "@/models/post";

const posts = (
  postRecords as StrapiPostCollection
).data.map(Post.fromData);

export async function generateStaticParams() {
  return posts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = posts.find((entry) => entry.slug === slug);

  return post
    ? { title: post.title, description: post.description }
    : {};
}

export default async function AcademyPostRoute(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;
  const post = posts.find((entry) => entry.slug === slug);

  if (!post) notFound();

  return <AcademyPostPage slug={slug} initialPost={{ ...post }} />;
}

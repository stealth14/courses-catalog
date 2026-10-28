import type { Meta } from "@/interfaces/results";
import type { StrapiMedia } from "@/interfaces/strapi-media";
import type { StrapiRichTextBlock } from "@/interfaces/strapi-rich-text";

export type PostText = {
  title: string;
  description: string;
  content: string;
  richContent?: StrapiRichTextBlock[];
};

/** Strapi v5 post entry with localized text and populated media relations. */
export type PostData = {
  id: number;
  documentId: string;
  slug: string;
  en: PostText;
  es: PostText;
  thumbnail: StrapiMedia | null;
  cover: StrapiMedia | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};

export type PostSearchParams = {
  locale?: string;
  sort?: string | string[];
  pagination?: { page?: number; pageSize?: number };
  filters?: Record<string, unknown>;
  [key: string]: unknown;
};

/** Strapi v5 collection response for `GET /api/posts?populate=*`. */
export type StrapiPostCollection = {
  data: PostData[];
  meta?: Meta;
};

/** Post model backed by the local Strapi-shaped fixture until API wiring. */
export class Post {
  readonly id: number;
  readonly documentId: string;
  readonly slug: string;
  readonly en: PostText;
  readonly es: PostText;
  readonly thumbnail: StrapiMedia | null;
  readonly cover: StrapiMedia | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedAt: string | null;

  constructor(data: PostData) {
    this.id = data.id;
    this.documentId = data.documentId;
    this.slug = data.slug;
    this.en = data.en;
    this.es = data.es;
    this.thumbnail = data.thumbnail;
    this.cover = data.cover;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.publishedAt = data.publishedAt;
  }

  static fromData(data: PostData): Post {
    return new Post(data);
  }

  /** Resolves a post's text for the active locale, defaulting to English. */
  static localize(post: Pick<PostData, "en" | "es">, locale: string): PostText {
    return locale === "es" ? post.es : post.en;
  }

  static async search(
    params: PostSearchParams = {}
  ): Promise<{ items: Post[]; meta: Meta }> {
    try {
      // The local fixture doesn't implement Strapi query parameters.
      void params;
      const response = await fetch("/posts.json");

      if (!response.ok) {
        throw new Error(`Posts request failed with status ${response.status}.`);
      }

      const collection =
        (await response.json()) as StrapiPostCollection;
      const items = collection.data.map(Post.fromData);

      return {
        items,
        meta:
          collection.meta ??
          Post.buildMeta(items.length),
      };
    } catch (error) {
      console.error("[Post.search]", error);
      throw error;
    }
  }

  static async findOne(documentId: string): Promise<Post | null> {
    try {
      const { items } = await Post.search();
      return items.find((post) => post.documentId === documentId) ?? null;
    } catch (error) {
      console.error("[Post.findOne]", error);
      throw error;
    }
  }

  private static buildMeta(count: number): Meta {
    return {
      pagination: {
        page: 1,
        pageSize: count,
        pageCount: 1,
        total: count,
      },
    };
  }
}

import type { Meta } from "@/interfaces/results";
import type { StrapiMedia } from "@/interfaces/strapi-media";

/** Flat Strapi v5 post entry with populated, one-to-one media relations. */
export type PostData = {
  id: number;
  documentId: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  thumbnail: StrapiMedia;
  cover: StrapiMedia;
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
  readonly title: string;
  readonly description: string;
  readonly content: string;
  readonly thumbnail: StrapiMedia;
  readonly cover: StrapiMedia;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedAt: string | null;

  constructor(data: PostData) {
    this.id = data.id;
    this.documentId = data.documentId;
    this.slug = data.slug;
    this.title = data.title;
    this.description = data.description;
    this.content = data.content;
    this.thumbnail = data.thumbnail;
    this.cover = data.cover;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.publishedAt = data.publishedAt;
  }

  static fromData(data: PostData): Post {
    return new Post(data);
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

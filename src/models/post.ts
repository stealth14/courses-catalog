import type { Meta } from "@/interfaces/results";
import type { StrapiMarkdown } from "@/interfaces/strapi-markdown";
import type { StrapiMedia } from "@/interfaces/strapi-media";
import api from "@/utils/api";

export type PostText = {
  title: string;
  description: string;
  markdown: StrapiMarkdown;
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

/** Strapi v5 single-entry response for `GET /api/posts/:documentId`. */
export type StrapiPostSingle = {
  data: PostData | null;
};

/** Post model backed by the Strapi `api::post.post` content type. */
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
    return new Post({
      ...data,
      en: Post.normalizeText(data.en),
      es: Post.normalizeText(data.es),
      thumbnail: data.thumbnail ?? null,
      cover: data.cover ?? null,
      publishedAt: data.publishedAt ?? null,
    });
  }

  /** Resolves a post's text for the active locale, defaulting to English. */
  static localize(post: Pick<PostData, "en" | "es">, locale: string): PostText {
    return locale === "es" ? post.es : post.en;
  }

  /** Strapi returns `null` for an unfilled locale component. */
  private static normalizeText(text: PostText | null): PostText {
    return {
      title: text?.title ?? "",
      description: text?.description ?? "",
      markdown: text?.markdown ?? "",
    };
  }

  /**
   * Lists posts from Strapi.
   *
   * `populate=*` is always applied so relations/components come back
   * resolved; the caller cannot override it. Errors are re-thrown so
   * callers can surface them in the UI — there is no local-data fallback.
   *
   * @param params Strapi query params (pagination, filters, sort, …).
   * @returns The posts and their pagination meta.
   */
  static async search(
    params: PostSearchParams = {}
  ): Promise<{ items: Post[]; meta: Meta }> {
    try {
      // populate=* covers everything — strip any caller-supplied value.
      const rest: Record<string, unknown> = { ...params };
      delete rest.populate;

      const response = await api.public.get<StrapiPostCollection>(
        "/posts?populate=*",
        { params: rest }
      );

      const items = (response.data.data ?? []).map(Post.fromData);

      return {
        items,
        meta: response.data.meta ?? Post.buildMeta(items.length),
      };
    } catch (error) {
      console.error("[Post.search]", error);
      throw error;
    }
  }

  /**
   * Finds one post by its Strapi `documentId` (the stable UUID — not the
   * numeric `id`, which can change between environments).
   *
   * @returns The post, or null when Strapi has no such entry.
   */
  static async findOne(documentId: string): Promise<Post | null> {
    try {
      const response = await api.public.get<StrapiPostSingle>(
        `/posts/${documentId}?populate=*`
      );

      return response.data.data ? Post.fromData(response.data.data) : null;
    } catch (error) {
      console.error("[Post.findOne]", error);
      throw error;
    }
  }

  /**
   * Finds one post by its `slug`, using a Strapi filter so the whole
   * collection is not transferred.
   *
   * @returns The post, or null when no entry matches the slug.
   */
  static async findBySlug(slug: string): Promise<Post | null> {
    try {
      const { items } = await Post.search({
        filters: { slug: { $eq: slug } },
        pagination: { pageSize: 1 },
      });

      return items[0] ?? null;
    } catch (error) {
      console.error("[Post.findBySlug]", error);
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


// ═════════════════════════════════════════════════════════════════════
//  EXAMPLE ONLY — DO NOT IMPORT THIS FILE INTO PRODUCTION CODE.
//
//  This file is the reference template for every MODEL in this project.
//  To create a real model for a Strapi v5 content type:
//
//    1. Copy this file to `src/models/<name>.ts` (e.g. `post.ts`).
//    2. Rename the class (e.g. `Post`), its attributes and endpoint
//       (`/posts`) to match the content type configured in the Strapi
//       admin panel.
//    3. Adjust the attribute types / relations to the real content type
//       (same conventions: flat v5 fields, `documentId`, `populate=*`).
//    4. Delete this header and the `.example` suffix.
//
//  Project data-layer conventions:
//    · `src/utils/api.ts`   — shared axios instances (`api.public`,
//      `api.upload`). The Strapi bearer token is attached automatically
//      on the server, so every mutation MUST run server-side (server
//      actions, route handlers, server components).
//    · `src/interfaces/`    — generic Strapi v5 response/error shapes
//      (`strapi-responses.ts`, `strapi-media.ts`, `results.ts`).
//    · `src/hooks/*.ts`     — React data hooks that wrap these models
//      (see `src/hooks/post.example.ts` / `posts.example.ts`).
//
//  Strapi v5 REST notes (relevant for every model):
//    · Collection:  GET  /api/<type>?populate=*          → { data: [...], meta }
//    · Single:      GET  /api/<type>/:documentId         → { data: {...} | null }
//    · Create:      POST /api/<type>        body { data: {...} }
//    · Update:      PUT  /api/<type>/:documentId   body { data: {...} }
//    · Upload:      POST /api/upload (multipart, field "files")
//    · v5 entries are FLAT: custom fields live at the same level as
//      `id` / `documentId` (the v4 `attributes` wrapper no longer
//      exists).
//    · `populate=*` resolves relations and components (screenshot,
//      group, …) into the entry itself.
// ═════════════════════════════════════════════════════════════════════

import api from '@/utils/api';
import { Meta } from '@/interfaces/results';
import type Group from '@/models/Group.example';
import type { AxiosResponse, AxiosError } from 'axios';
import type { StrapiSingleResponse, StrapiErrorResponse } from '@/interfaces/strapi-responses';
import type { StrapiMedia } from '@/interfaces/strapi-media';

// ── Domain types ─────────────────────────────────────────────────────

/** Lifecycle stages a Post can be in (Strapi v5 enumeration values). */
export type PostStage = 'new' | 'digested' | 'addressed';

/** Business opportunities a Post can target (Strapi v5 enumeration). */
export type PostOportunity = 'deliverable' | 'consulting' | 'employee';

/** A single contact entry (Strapi v5 component `contact`). */
export interface Contact {
    field: string;
    value: string;
}

// ── Post-specific Strapi types ──────────────────────────────────────

/**
 * Attributes returned by Strapi for a single Post entity.
 *
 * NOTE: in Strapi v5 these fields arrive FLAT on the entry (not wrapped
 * in an `attributes` object). Optional fields are absent from the
 * response when they have no value. `screenshot` is a media relation
 * resolved by `populate=*`.
 */
export interface PostAttributes {
    summary: string;
    url: string;
    stage: PostStage;
    /** Related group — accepts either a populated object or a plain id. */
    group?: { id: number } | number;
    oportunity?: PostOportunity;
    contacts?: Contact[];
    screenshot?: StrapiMedia;
    createdAt?: string;
    updatedAt?: string;
    publishedAt?: string;
}

/** Strapi success envelope for a Post creation. */
export type PostCreationResponse = StrapiSingleResponse<PostAttributes>;

/** Full axios success response for a Post creation. */
export type PostSaveResponse = AxiosResponse<PostCreationResponse>;

/** Full axios error thrown on a failed Post creation. */
export type PostSaveError = AxiosError<StrapiErrorResponse>;

// ── Post model ──────────────────────────────────────────────────────

/**
 * Post model — the data layer for the Strapi `api::post.post` content
 * type.
 *
 * Usage patterns to copy for other models:
 *   · Instance fields mirror the Strapi attributes 1:1.
 *   · `search()`   — list + pagination meta (used by collection hooks).
 *   · `findOne()`  — single lookup by `documentId` (used by detail hooks).
 *   · `save()`     — create (used by forms via server actions).
 *   · `update()`   — update, with an optional screenshot upload.
 *   · Errors are logged with a `[Post.method]` prefix and re-thrown so
 *     hooks can turn them into an `error` status.
 */
export default class Post {
    id: number;
    documentId: string;
    summary: string;
    url: string;
    stage: PostStage;
    oportunity?: PostOportunity;
    contacts?: Contact[];
    screenshot?: StrapiMedia;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    group?: Group;

    constructor(id: number, documentId: string, summary: string, url: string, stage: PostStage, createdAt: string, updatedAt: string, publishedAt: string, group?: Group, oportunity?: PostOportunity, contacts?: Contact[], screenshot?: StrapiMedia) {
        this.id = id;
        this.documentId = documentId;
        this.summary = summary;
        this.url = url;
        this.stage = stage;
        this.oportunity = oportunity;
        this.contacts = contacts;
        this.screenshot = screenshot;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.publishedAt = publishedAt;
        this.group = group;
    }

    /**
     * Lists Posts with pagination.
     *
     * `params` is forwarded to Strapi as query-string parameters
     * (pagination, filters, sort, …). Any caller-supplied `populate` is
     * stripped and replaced by `populate=*` so every relation/component
     * is always resolved and never duplicated.
     *
     * @returns The raw Strapi entries and their pagination meta.
     */
    static async search(params: Record<string, unknown> = {}): Promise<{ items: Post[], meta: Meta }> {
        try {
            // populate=* covers everything — strip caller's populate to avoid duplicates
            const rest: Record<string, unknown> = { ...params };
            delete rest.populate;
            const response = await api.public.get('/posts?populate=*', { params: rest });

            const posts = response.data.data;
            const meta = response.data.meta;

            return { items: posts, meta };
        } catch (err) {
            console.error('[Post.search]', err);
            throw err;
        }
    }

    /**
     * Finds one Post by its Strapi `documentId` (the stable UUID — not
     * the numeric `id`, which can change between environments).
     *
     * @returns The Post, or null when Strapi has no such entry.
     */
    static async findOne(documentId: string): Promise<Post | null> {
        try {
            const { data } = await api.public.get<StrapiSingleResponse<PostAttributes>>(
                `/posts/${documentId}?populate=*`,
            );
            return data.data ? (data.data as unknown as Post) : null;
        } catch (err) {
            console.error('[Post.findOne]', err);
            throw err;
        }
    }

    /**
     * Creates a new Post (POST /api/posts).
     *
     * The Strapi v5 write payload wraps the fields in `{ data: {...} }`.
     * Must run on the SERVER only — the api token is attached server-side
     * and must never reach the browser.
     *
     * @returns The full axios response, including the created entry.
     */
    static async save(post: Pick<Post, 'summary' | 'url' | 'stage'> & { group: string; screenshot?: number | null } & Partial<Pick<Post, 'oportunity' | 'contacts'>>): Promise<PostSaveResponse> {
        try {
            return await api.public.post<PostSaveResponse['data']>('/posts', { data: post });
        } catch (err) {
            console.error('[Post.save]', err);
            throw err;
        }
    }


    /**
     * Update post fields and optionally attach a screenshot.
     *
     * When screenshotBase64 is provided:
     *   1. POST /upload  → get the media ID
     *   2. PUT /posts/:documentId  → { data: { ...fields, screenshot: mediaId } }
     *
     * The base64 string is decoded into a Blob and sent as multipart
     * FormData through `api.upload` (axios sets the boundary itself —
     * no Content-Type header must be set). Upload failures are non-fatal:
     * the field update is still attempted and a warning is logged.
     */
    static async update(
        documentId: string,
        data: Partial<Pick<Post, 'summary' | 'stage' | 'oportunity' | 'contacts'>>,
        screenshotBase64?: string,
    ): Promise<PostSaveResponse> {
        const payload: Record<string, unknown> = { ...data };

        if (screenshotBase64) {
            const byteString = atob(screenshotBase64);
            const ab = new ArrayBuffer(byteString.length);
            const ia = new Uint8Array(ab);
            for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            const blob = new Blob([ab], { type: 'image/png' });

            // Strapi v5 upload response: [{ id, documentId, ... }]
            const form = new FormData();
            form.append('files', blob, 'screenshot.png');

            try {
                const uploadRes = await api.upload.post('/upload', form);
                const uploaded = Array.isArray(uploadRes.data) ? uploadRes.data[0] : uploadRes.data;
                payload.screenshot = uploaded.id;
            } catch (err) {
                console.warn('[Post.update] upload failed, continuing:', err);
            }
        }

        try {
            return await api.public.put<PostSaveResponse['data']>(`/posts/${documentId}`, { data: payload });
        } catch (err) {
            console.error('[Post.update]', err);
            throw err;
        }
    }
}
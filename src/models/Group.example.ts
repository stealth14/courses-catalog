// ═════════════════════════════════════════════════════════════════════
//  EXAMPLE ONLY — DO NOT IMPORT THIS FILE INTO PRODUCTION CODE.
//
//  Minimal template for a related content type (e.g. `api::group.group`).
//  It exists so the `post.example.ts` model template compiles; real
//  models should follow the same conventions documented there (flat v5
//  fields, `documentId`, standard timestamps).
// ═════════════════════════════════════════════════════════════════════

export default class Group {
    id: number;
    documentId: string;
    name: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string | null;

    constructor(id: number, documentId: string, name: string, createdAt: string, updatedAt: string, publishedAt: string | null) {
        this.id = id;
        this.documentId = documentId;
        this.name = name;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.publishedAt = publishedAt;
    }
}

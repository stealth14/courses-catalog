import type { StrapiMedia } from "@/interfaces/strapi-media";

type StrapiRichTextText = {
  type: "text";
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
};

type StrapiRichTextInline =
  | StrapiRichTextText
  | {
      type: "link";
      url: string;
      children: StrapiRichTextText[];
    };

type StrapiRichTextListItem = {
  type: "list-item";
  children: (StrapiRichTextInline | StrapiRichTextListItem)[];
};

/** A block in Strapi v5's Blocks rich-text field. */
export type StrapiRichTextBlock =
  | { type: "paragraph"; children: StrapiRichTextInline[] }
  | {
      type: "heading";
      level: 1 | 2 | 3 | 4 | 5 | 6;
      children: StrapiRichTextInline[];
    }
  | { type: "quote"; children: StrapiRichTextInline[] }
  | { type: "code"; children: StrapiRichTextText[] }
  | {
      type: "list";
      format: "ordered" | "unordered";
      children: StrapiRichTextListItem[];
    }
  | {
      type: "image";
      image: Pick<
        StrapiMedia,
        "name" | "alternativeText" | "url" | "caption" | "width" | "height" | "formats"
      >;
      children: StrapiRichTextText[];
    };

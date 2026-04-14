import type { JSONContent } from "@tiptap/react";

export type TipTapDocument = JSONContent;

export type ArticleBlockType =
  | "text"
  | "heading"
  | "ad"
  | "image"
  | "divider"
  | "quote"
  | "code"
  | "callout"
  | "video";

export type ArticleRichTextContent = TipTapDocument | string;

export interface ArticleTextBlock {
  id: string;
  type: "text";
  content: ArticleRichTextContent;
}

export interface ArticleHeadingBlock {
  id: string;
  type: "heading";
  content: ArticleRichTextContent;
}

export interface ArticleAdBlock {
  id: string;
  type: "ad";
  content: {
    slot: string;
  };
}

export interface ArticleImageBlock {
  id: string;
  type: "image";
  content: {
    url: string;
    caption?: string;
  };
}

export interface ArticleDividerBlock {
  id: string;
  type: "divider";
  content: null;
}

export interface ArticleQuoteBlock {
  id: string;
  type: "quote";
  content: {
    text: string;
    author?: string;
  };
}

export interface ArticleCodeBlock {
  id: string;
  type: "code";
  content: {
    code: string;
    language?: string;
  };
}

export interface ArticleCalloutBlock {
  id: string;
  type: "callout";
  content: {
    type: "info" | "warning" | "success" | "tip";
    text: string;
  };
}

export interface ArticleVideoBlock {
  id: string;
  type: "video";
  content: {
    url: string;
  };
}

export type ArticleBlock =
  | ArticleTextBlock
  | ArticleHeadingBlock
  | ArticleAdBlock
  | ArticleImageBlock
  | ArticleDividerBlock
  | ArticleQuoteBlock
  | ArticleCodeBlock
  | ArticleCalloutBlock
  | ArticleVideoBlock;

const BLOCK_TYPES: ArticleBlockType[] = [
  "text",
  "heading",
  "ad",
  "image",
  "divider",
  "quote",
  "code",
  "callout",
  "video",
];

export function createArticleBlockId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `block-${Math.random().toString(36).slice(2, 10)}`;
}

export function createHeadingDocument(level = 2): TipTapDocument {
  return {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level },
      },
    ],
  };
}

export function createParagraphDocument(): TipTapDocument {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
      },
    ],
  };
}

export function createEmptyArticleBlock(type: ArticleBlockType): ArticleBlock {
  switch (type) {
    case "text":
      return {
        id: createArticleBlockId(),
        type,
        content: createParagraphDocument(),
      };
    case "heading":
      return {
        id: createArticleBlockId(),
        type,
        content: createHeadingDocument(),
      };
    case "image":
      return {
        id: createArticleBlockId(),
        type,
        content: { url: "", caption: "" },
      };
    case "ad":
      return {
        id: createArticleBlockId(),
        type,
        content: { slot: "article-inline" },
      };
    case "divider":
      return {
        id: createArticleBlockId(),
        type,
        content: null,
      };
    case "quote":
      return {
        id: createArticleBlockId(),
        type,
        content: { text: "", author: "" },
      };
    case "code":
      return {
        id: createArticleBlockId(),
        type,
        content: { code: "", language: "typescript" },
      };
    case "callout":
      return {
        id: createArticleBlockId(),
        type,
        content: { type: "info", text: "" },
      };
    case "video":
      return {
        id: createArticleBlockId(),
        type,
        content: { url: "" },
      };
  }
}

export function isTipTapDocument(value: unknown): value is TipTapDocument {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    (value as { type?: unknown }).type === "doc"
  );
}

function isArticleBlock(value: unknown): value is ArticleBlock {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as { id?: unknown; type?: unknown; content?: unknown };
  return (
    typeof candidate.id === "string" &&
    typeof candidate.type === "string" &&
    BLOCK_TYPES.includes(candidate.type as ArticleBlockType) &&
    "content" in candidate
  );
}

export function isArticleBlockArray(value: unknown): value is ArticleBlock[] {
  return Array.isArray(value) && value.every(isArticleBlock);
}

export function normalizeArticleEditorContent(content: unknown): ArticleBlock[] {
  if (isArticleBlockArray(content) && content.length > 0) {
    return content;
  }

  if (isTipTapDocument(content)) {
    return [
      {
        id: createArticleBlockId(),
        type: "text",
        content,
      },
    ];
  }

  if (typeof content === "string" && content.trim()) {
    return [
      {
        id: createArticleBlockId(),
        type: "text",
        content,
      },
    ];
  }

  return [createEmptyArticleBlock("text")];
}

export function getYouTubeVideoId(url: string) {
  const match = url.match(
    /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]{11}).*/,
  );

  return match?.[1] ?? null;
}

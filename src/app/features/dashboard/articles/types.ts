import type { ArticleBlock } from "@/app/features/dashboard/articles/content";

export type ArticleStatus =
  | "draft"
  | "need_factcheck"
  | "need_read"
  | "published";

export interface ArticleTag {
  id: string;
  name: string;
  description: string | null;
}

export interface ArticleKeyword {
  id: string;
  name: string;
}

export interface DashboardArticle {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  imageUrl: string | null;
  content?: unknown;
  status: ArticleStatus;
  readingTime: number | null;
  viewCount: number;
  likesCount: number;
  createdAt: Date;
  premiumOnly: boolean;
  ratingEnabled: boolean;
  commentsEnabled: boolean;
  tags: ArticleTag[];
  keywords?: ArticleKeyword[];
  author: {
    id: string;
    name: string;
    surname: string;
    image: string | null;
  } | null;
}

export interface ArticlePayload {
  title: string;
  description?: string;
  slug: string;
  imageUrl?: string;
  content?: ArticleBlock[] | unknown;
  authorId?: string;
  status: ArticleStatus;
  ratingEnabled: boolean;
  commentsEnabled: boolean;
  premiumOnly: boolean;
  tagIds: string[];
  keywords: string[];
}

export type { ArticleBlock } from "@/app/features/dashboard/articles/content";

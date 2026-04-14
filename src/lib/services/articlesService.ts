import {
  getPublishedArticles,
  getPublishedArticlesByTagIds,
  getHeroArticle,
  getArticleById,
  getArticleBySlug,
  getArticleTagsByArticleIds,
  getRelatedArticles,
  searchArticles,
  getArticlesBySection,
  type ArticleWithAuthor,
  type ArticleWithAuthorAndTags,
} from "@/lib/repositories/articlesRepository";
import type { ArticleCard, ArticleDetail } from "@/lib/schemas/articlesSchema";
import getReadingTime from "reading-time";

function extractTextFromContent(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content.map(extractTextFromContent).join(" ");
  }

  if (typeof content === "object" && content !== null) {
    return Object.values(content).map(extractTextFromContent).join(" ");
  }

  return "";
}

function resolveReadingTime(article: ArticleWithAuthor | ArticleWithAuthorAndTags): number | null {
  if (article.readingTime !== null) {
    return article.readingTime;
  }

  if (!("content" in article)) {
    return null;
  }

  const text = extractTextFromContent(article.content).trim();

  if (!text) {
    return null;
  }

  const minutes = Math.ceil(getReadingTime(text).minutes);
  return Number.isFinite(minutes) ? Math.max(1, minutes) : null;
}

/**
 * Transformuje článek z DB formátu na UI formát pro karty
 */
function toArticleCard(article: ArticleWithAuthor, category?: string | null): ArticleCard {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    description: article.description,
    imageUrl: article.imageUrl,
    readingTime: resolveReadingTime(article),
    authorName: article.author 
      ? `${article.author.name} ${article.author.surname}` 
      : "Neznámý autor",
    authorAvatar: article.author?.image ?? null,
    publishedAt: article.createdAt.toISOString(),
    category: category ?? null,
    articleUrl: `/article/${article.slug}`,
  };
}

/**
 * Transformuje článek z DB formátu na UI formát pro detail
 */
function toArticleDetail(article: ArticleWithAuthorAndTags): ArticleDetail {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    description: article.description,
    imageUrl: article.imageUrl,
    content: article.content,
    premiumOnly: article.premiumOnly,
    authorName: article.author 
      ? `${article.author.name} ${article.author.surname}` 
      : "Neznámý autor",
    authorAvatar: article.author?.image ?? null,
    publishedAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    readingTime: resolveReadingTime(article),
    viewCount: article.viewCount,
    likesCount: article.likesCount,
    dislikesCount: article.dislikesCount,
    tags: article.tags,
    ratingEnabled: article.ratingEnabled,
    commentsEnabled: article.commentsEnabled,
    threadId: article.threadId,
  };
}

/**
 * Získání článků pro homepage (hero + latest)
 */
export async function getHomepageArticles(): Promise<{
  hero: ArticleCard | null;
  latest: ArticleCard[];
}> {
  const [heroArticle, latestArticles] = await Promise.all([
    getHeroArticle(),
    getPublishedArticles(8, 0),
  ]);

  // Odstranit hero článek z latest, pokud tam je
  const filteredLatest = heroArticle
    ? latestArticles.filter((a) => a.id !== heroArticle.id)
    : latestArticles;

  return {
    hero: heroArticle ? toArticleCard(heroArticle) : null,
    latest: filteredLatest.map((a) => toArticleCard(a)),
  };
}

/**
 * Získání článků pro /articles stránku s filtrováním
 */
export async function getArticlesList(options?: {
  query?: string;
  limit?: number;
  offset?: number;
  tagIds?: string[];
}): Promise<ArticleCard[]> {
  const { query, limit = 20, offset = 0, tagIds } = options || {};

  let articles: ArticleWithAuthor[];

  if (query && query.trim().length > 0) {
    articles = await searchArticles(query.trim(), limit, offset);
  } else if (tagIds && tagIds.length > 0) {
    articles = await getPublishedArticlesByTagIds(tagIds, limit, offset);
  } else {
    articles = await getPublishedArticles(limit, offset);
  }

  const cards = articles.map((a) => toArticleCard(a));
  const tagsByArticleId = await getArticleTagsByArticleIds(articles.map((a) => a.id));

  return cards.map((card) => ({
    ...card,
    tags: tagsByArticleId[card.id] ?? [],
  }));
}

/**
 * Získání detailu článku pro /article/[slug] stránku
 */
export async function getArticleDetail(
  slug: string
): Promise<ArticleDetail | null> {
  const article = await getArticleBySlug(slug);

  if (!article) return null;

  return toArticleDetail(article);
}

export async function getArticleDetailById(
  articleId: string,
): Promise<ArticleDetail | null> {
  const article = await getArticleById(articleId);

  if (!article) return null;

  return toArticleDetail(article);
}

/**
 * Získání souvisejících článků
 */
export async function getRelatedArticlesForUI(
  articleId: string,
  limit: number = 3
): Promise<ArticleCard[]> {
  const articles = await getRelatedArticles(articleId, limit);
  return articles.map((a) => toArticleCard(a));
}

/**
 * Získání článků pro konkrétní sekci a tag
 */
export async function getArticlesBySectionList(
  sectionSlug: string,
  options?: {
    tagSlug?: string;
    limit?: number;
    offset?: number;
  }
): Promise<ArticleCard[]> {
  const articles = await getArticlesBySection(sectionSlug, options);
  const cards = articles.map((a) => toArticleCard(a));
  const tagsByArticleId = await getArticleTagsByArticleIds(articles.map((a) => a.id));

  return cards.map((card) => ({
    ...card,
    tags: tagsByArticleId[card.id] ?? [],
  }));
}

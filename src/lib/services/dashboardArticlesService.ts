import { db } from "@/lib/db";
import {
  deleteArticle,
  getAllArticlesForDashboard,
  getArticleById,
  syncArticleKeywords,
  updateArticle,
  updateArticleStatus,
} from "@/lib/repositories/articlesRepository";
import { articleTags, articles } from "@/lib/schema";
import {
  CreateArticleSchema,
  UpdateArticleSchema,
} from "@/lib/schemas/articlesSchema";
import { normalizeSlug } from "@/lib/utils/slug";

export async function listDashboardArticlesService(input: {
  status?: "draft" | "need_factcheck" | "need_read" | "published";
  limit: number;
  offset: number;
}) {
  const articlesList = await getAllArticlesForDashboard(input);
  return { articles: articlesList };
}

export async function updateDashboardArticleStatusService(input: {
  articleId: string;
  status: "draft" | "need_factcheck" | "need_read" | "published";
}) {
  return updateArticleStatus(input.articleId, input.status);
}

export async function deleteDashboardArticleService(articleId: string) {
  return deleteArticle(articleId);
}

export async function createDashboardArticleService(
  userId: string,
  data: unknown,
) {
  const payload = CreateArticleSchema.parse(data);
  const normalizedSlug = normalizeSlug(payload.slug);

  if (!normalizedSlug) {
    throw new Error("Slug clanku je neplatny");
  }

  const created = await db
    .insert(articles)
    .values({
      authorId: payload.authorId ?? userId,
      title: payload.title,
      description: payload.description ?? null,
      slug: normalizedSlug,
      imageUrl: payload.imageUrl ?? null,
      content: payload.content ?? null,
      status: payload.status,
      premiumOnly: payload.premiumOnly,
      ratingEnabled: payload.ratingEnabled,
      commentsEnabled: payload.commentsEnabled,
    })
    .returning({
      id: articles.id,
      slug: articles.slug,
    });

  const article = created[0];
  if (!article) {
    throw new Error("Nepodarilo se vytvorit clanek");
  }

  if (payload.tagIds?.length) {
    const uniqueTagIds = Array.from(new Set(payload.tagIds));
    await db.insert(articleTags).values(
      uniqueTagIds.map((tagId) => ({
        articleId: article.id,
        tagId,
      })),
    );
  }

  if (payload.keywords?.length) {
    await syncArticleKeywords(article.id, payload.keywords);
  }

  return article;
}

export async function getDashboardArticleService(articleId: string) {
  return getArticleById(articleId);
}

export async function updateDashboardArticleService(
  articleId: string,
  data: unknown,
) {
  const payload = UpdateArticleSchema.parse(data);
  const normalizedSlug =
    payload.slug !== undefined ? normalizeSlug(payload.slug) : undefined;

  if (payload.slug !== undefined && !normalizedSlug) {
    throw new Error("Slug clanku je neplatny");
  }

  return updateArticle(articleId, {
    ...payload,
    slug: normalizedSlug,
  });
}

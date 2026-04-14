import {
  createReport,
  getReportsByStatus,
  getReportsForEntity,
  updateReportStatus,
  hasUserReportedEntity,
  type ReportWithUsers,
} from "@/lib/repositories/reportsRepository";
import { getCommentById } from "@/lib/repositories/commentsRepository";
import { db } from "@/lib/db";
import { articles } from "@/lib/schema";
import { eq } from "drizzle-orm";

/**
 * Reportování komentáře
 */
export async function reportComment(
  userId: string,
  commentId: string,
  reason: string
): Promise<ReportWithUsers> {
  // Validace důvodu
  const trimmedReason = reason.trim();
  if (!trimmedReason || trimmedReason.length === 0) {
    throw new Error("Důvod reportu nemůže být prázdný");
  }

  if (trimmedReason.length > 2000) {
    throw new Error("Důvod reportu může mít maximálně 2000 znaků");
  }

  // Kontrola existence komentáře
  const comment = await getCommentById(commentId);
  if (!comment) {
    throw new Error("Komentář nenalezen");
  }

  // Kontrola, zda uživatel již reportoval tento komentář
  const alreadyReported = await hasUserReportedEntity(
    userId,
    "comment",
    commentId
  );
  if (alreadyReported) {
    throw new Error("Tento komentář jste již nahlásili");
  }

  return await createReport({
    reporterId: userId,
    entityType: "comment",
    entityId: commentId,
    reason: trimmedReason,
  });
}

/**
 * Reportování článku
 */
export async function reportArticle(
  userId: string,
  articleId: string,
  reason: string
): Promise<ReportWithUsers> {
  // Validace důvodu
  const trimmedReason = reason.trim();
  if (!trimmedReason || trimmedReason.length === 0) {
    throw new Error("Důvod reportu nemůže být prázdný");
  }

  if (trimmedReason.length > 2000) {
    throw new Error("Důvod reportu může mít maximálně 2000 znaků");
  }

  // Kontrola existence článku
  const articleResult = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.id, articleId))
    .limit(1);

  if (articleResult.length === 0) {
    throw new Error("Článek nenalezen");
  }

  // Kontrola, zda uživatel již reportoval tento článek
  const alreadyReported = await hasUserReportedEntity(
    userId,
    "article",
    articleId
  );
  if (alreadyReported) {
    throw new Error("Tento článek jste již nahlásili");
  }

  return await createReport({
    reporterId: userId,
    entityType: "article",
    entityId: articleId,
    reason: trimmedReason,
  });
}

/**
 * Seznam reportů pro moderaci (pending reporty)
 */
export async function listReportsForModeration(options?: {
  limit?: number;
  offset?: number;
  sortOrder?: "newest" | "oldest";
}): Promise<ReportWithUsers[]> {
  return await getReportsByStatus("pending", options);
}

/**
 * Vyřešení reportu (resolve nebo dismiss)
 */
export async function resolveReport(
  reportId: string,
  adminId: string,
  action: "resolve" | "dismiss"
): Promise<ReportWithUsers> {
  const status = action === "resolve" ? "resolved" : "dismissed";

  return await updateReportStatus({
    reportId,
    status,
    reviewedBy: adminId,
  });
}

/**
 * Získání reportů pro entitu
 */
export async function getReportsForEntityService(
  entityType: "comment" | "article",
  entityId: string
): Promise<ReportWithUsers[]> {
  return await getReportsForEntity(entityType, entityId);
}

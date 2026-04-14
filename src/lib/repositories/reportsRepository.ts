import { db } from "@/lib/db";
import { reports, users, comments, articles } from "@/lib/schema";
import { eq, and, desc, asc, sql, or } from "drizzle-orm";

/**
 * Typ reportu s informacemi o reportujícím a recenzentovi
 */
export type ReportWithUsers = {
  id: string;
  reporterId: string;
  entityType: "comment" | "article";
  entityId: string;
  reason: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  reviewedBy: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  reporter: {
    id: string;
    name: string;
    surname: string;
    email: string;
  };
  reviewer: {
    id: string;
    name: string;
    surname: string;
    email: string;
  } | null;
};

/**
 * Vytvoření nového reportu
 */
export async function createReport(data: {
  reporterId: string;
  entityType: "comment" | "article";
  entityId: string;
  reason: string;
}): Promise<ReportWithUsers> {
  const [newReport] = await db
    .insert(reports)
    .values({
      reporterId: data.reporterId,
      entityType: data.entityType,
      entityId: data.entityId,
      reason: data.reason,
      status: "pending",
    })
    .returning();

  // Získat informace o reportujícím
  const reporterResult = await db
    .select({
      id: users.id,
      name: users.name,
      surname: users.surname,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, data.reporterId))
    .limit(1);

  return {
    id: newReport.id,
    reporterId: newReport.reporterId,
    entityType: data.entityType,
    entityId: newReport.entityId,
    reason: newReport.reason,
    status: newReport.status,
    reviewedBy: newReport.reviewedBy,
    reviewedAt: newReport.reviewedAt,
    createdAt: newReport.createdAt,
    reporter: reporterResult[0]!,
    reviewer: null,
  };
}

/**
 * Získání reportů podle statusu s paginací
 */
export async function getReportsByStatus(
  status: "pending" | "reviewed" | "resolved" | "dismissed",
  options?: {
    limit?: number;
    offset?: number;
    sortOrder?: "newest" | "oldest";
  }
): Promise<ReportWithUsers[]> {
  const { limit = 50, offset = 0, sortOrder = "newest" } = options || {};

  let query = db
    .select({
      id: reports.id,
      reporterId: reports.reporterId,
      entityType: reports.entityType,
      entityId: reports.entityId,
      reason: reports.reason,
      status: reports.status,
      reviewedBy: reports.reviewedBy,
      reviewedAt: reports.reviewedAt,
      createdAt: reports.createdAt,
      reporter: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        email: users.email,
      },
    })
    .from(reports)
    .innerJoin(users, eq(reports.reporterId, users.id))
    .where(eq(reports.status, status));

  // Řazení
  if (sortOrder === "newest") {
    query = query.orderBy(desc(reports.createdAt)) as any;
  } else {
    query = query.orderBy(asc(reports.createdAt)) as any;
  }

  query = query.limit(limit).offset(offset) as any;

  const result = await query;

  // Pro každý report získat informace o recenzentovi (pokud existuje)
  const reportsWithReviewers = await Promise.all(
    result.map(async (report) => {
      let reviewer = null;
      if (report.reviewedBy) {
        const reviewerResult = await db
          .select({
            id: users.id,
            name: users.name,
            surname: users.surname,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, report.reviewedBy))
          .limit(1);

        reviewer = reviewerResult[0] || null;
      }

      return {
        ...report,
        entityType: report.entityType as "comment" | "article",
        reviewer,
      };
    })
  );

  return reportsWithReviewers;
}

/**
 * Získání všech reportů pro entitu (komentář nebo článek)
 */
export async function getReportsForEntity(
  entityType: "comment" | "article",
  entityId: string
): Promise<ReportWithUsers[]> {
  const result = await db
    .select({
      id: reports.id,
      reporterId: reports.reporterId,
      entityType: reports.entityType,
      entityId: reports.entityId,
      reason: reports.reason,
      status: reports.status,
      reviewedBy: reports.reviewedBy,
      reviewedAt: reports.reviewedAt,
      createdAt: reports.createdAt,
      reporter: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        email: users.email,
      },
    })
    .from(reports)
    .innerJoin(users, eq(reports.reporterId, users.id))
    .where(
      and(
        eq(reports.entityType, entityType),
        eq(reports.entityId, entityId)
      )
    )
    .orderBy(desc(reports.createdAt));

  // Pro každý report získat informace o recenzentovi (pokud existuje)
  const reportsWithReviewers = await Promise.all(
    result.map(async (report) => {
      let reviewer = null;
      if (report.reviewedBy) {
        const reviewerResult = await db
          .select({
            id: users.id,
            name: users.name,
            surname: users.surname,
            email: users.email,
          })
          .from(users)
          .where(eq(users.id, report.reviewedBy))
          .limit(1);

        reviewer = reviewerResult[0] || null;
      }

      return {
        ...report,
        entityType: report.entityType as "comment" | "article",
        reviewer,
      };
    })
  );

  return reportsWithReviewers;
}

/**
 * Aktualizace statusu reportu
 */
export async function updateReportStatus(data: {
  reportId: string;
  status: "pending" | "reviewed" | "resolved" | "dismissed";
  reviewedBy: string;
}): Promise<ReportWithUsers> {
  const [updatedReport] = await db
    .update(reports)
    .set({
      status: data.status,
      reviewedBy: data.reviewedBy,
      reviewedAt: new Date(),
    })
    .where(eq(reports.id, data.reportId))
    .returning();

  // Získat informace o reportujícím a recenzentovi
  const [reporterResult, reviewerResult] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        surname: users.surname,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, updatedReport.reporterId))
      .limit(1),
    db
      .select({
        id: users.id,
        name: users.name,
        surname: users.surname,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, data.reviewedBy))
      .limit(1),
  ]);

  return {
    ...updatedReport,
    entityType: updatedReport.entityType as "comment" | "article",
    reporter: reporterResult[0]!,
    reviewer: reviewerResult[0] || null,
  };
}

/**
 * Získání reportu podle ID
 */
export async function getReportById(
  reportId: string
): Promise<ReportWithUsers | null> {
  const result = await db
    .select({
      id: reports.id,
      reporterId: reports.reporterId,
      entityType: reports.entityType,
      entityId: reports.entityId,
      reason: reports.reason,
      status: reports.status,
      reviewedBy: reports.reviewedBy,
      reviewedAt: reports.reviewedAt,
      createdAt: reports.createdAt,
      reporter: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        email: users.email,
      },
    })
    .from(reports)
    .innerJoin(users, eq(reports.reporterId, users.id))
    .where(eq(reports.id, reportId))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const report = result[0];

  // Získat informace o recenzentovi (pokud existuje)
  let reviewer = null;
  if (report.reviewedBy) {
    const reviewerResult = await db
      .select({
        id: users.id,
        name: users.name,
        surname: users.surname,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, report.reviewedBy))
      .limit(1);

    reviewer = reviewerResult[0] || null;
  }

  return {
    ...report,
    entityType: report.entityType as "comment" | "article",
    reviewer,
  };
}

/**
 * Kontrola, zda uživatel již reportoval danou entitu
 */
export async function hasUserReportedEntity(
  userId: string,
  entityType: "comment" | "article",
  entityId: string
): Promise<boolean> {
  const result = await db
    .select({ id: reports.id })
    .from(reports)
    .where(
      and(
        eq(reports.reporterId, userId),
        eq(reports.entityType, entityType),
        eq(reports.entityId, entityId)
      )
    )
    .limit(1);

  return result.length > 0;
}

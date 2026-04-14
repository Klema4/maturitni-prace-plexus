import { db } from "@/lib/db";
import {
   organizationApplications,
   organizationMembers,
   organizations,
} from "@/lib/schema";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

export type OrganizationApplication = {
   id: string;
   applicantUserId: string;
   organizationId: string | null;
   status: "submitted" | "under_review" | "approved" | "rejected" | "withdrawn";
   companyName: string;
   websiteUrl: string | null;
   email: string;
   phone: string;
   location: string;
   ico: string | null;
   note: string | null;
   reviewedByUserId: string | null;
   reviewedAt: Date | null;
   rejectionReason: string | null;
   submittedAt: Date;
   createdAt: Date;
   updatedAt: Date;
};

export async function getLatestApplicationByApplicantUserId(
   applicantUserId: string,
): Promise<OrganizationApplication | null> {
   const result = await db
      .select()
      .from(organizationApplications)
      .where(eq(organizationApplications.applicantUserId, applicantUserId))
      .orderBy(desc(organizationApplications.createdAt))
      .limit(1);

   return (result[0] as OrganizationApplication) ?? null;
}

export async function getActiveApplicationByApplicantUserId(
   applicantUserId: string,
): Promise<OrganizationApplication | null> {
   const result = await db
      .select()
      .from(organizationApplications)
      .where(
         and(
            eq(organizationApplications.applicantUserId, applicantUserId),
            inArray(organizationApplications.status, [
               "submitted",
               "under_review",
            ]),
         ),
      )
      .orderBy(desc(organizationApplications.createdAt))
      .limit(1);

   return (result[0] as OrganizationApplication) ?? null;
}

export async function createOrganizationApplication(data: {
   applicantUserId: string;
   companyName: string;
   websiteUrl?: string | null;
   email: string;
   phone: string;
   location: string;
   ico?: string | null;
   note?: string | null;
}): Promise<OrganizationApplication> {
   const result = await db
      .insert(organizationApplications)
      .values({
         applicantUserId: data.applicantUserId,
         companyName: data.companyName,
         websiteUrl: data.websiteUrl || null,
         email: data.email,
         phone: data.phone,
         location: data.location,
         ico: data.ico || null,
         note: data.note || null,
         status: "submitted",
      })
      .returning();

   return result[0] as OrganizationApplication;
}

export async function getOrganizationApplicationById(
   id: string,
): Promise<OrganizationApplication | null> {
   const result = await db
      .select()
      .from(organizationApplications)
      .where(eq(organizationApplications.id, id))
      .limit(1);

   return (result[0] as OrganizationApplication) ?? null;
}

export async function listOrganizationApplications(status?: string) {
   const query = db.select().from(organizationApplications).$dynamic();

   const rows = status
      ? await query
           .where(
              eq(
                 organizationApplications.status,
                 status as OrganizationApplication["status"],
              ),
           )
           .orderBy(desc(organizationApplications.createdAt))
      : await query.orderBy(desc(organizationApplications.createdAt));

   return rows as OrganizationApplication[];
}

export async function approveOrganizationApplication(params: {
   applicationId: string;
   reviewerUserId: string;
}) {
   const now = new Date();

   const applicationRows = await db
      .select()
      .from(organizationApplications)
      .where(eq(organizationApplications.id, params.applicationId))
      .limit(1);

   const application = applicationRows[0] as OrganizationApplication | undefined;

   if (!application) {
      return null;
   }

   if (!["submitted", "under_review"].includes(application.status)) {
      throw new Error("INVALID_APPLICATION_STATE");
   }

   const orgRows = await db
      .insert(organizations)
      .values({
         name: application.companyName,
         websiteUrl: application.websiteUrl ?? undefined,
         email: application.email,
         phone: application.phone,
         location: application.location,
         ico: application.ico ?? undefined,
         verified: true,
         onboardingStatus: "active",
         approvedAt: now,
         approvedByUserId: params.reviewerUserId,
      })
      .returning({ id: organizations.id });

   const organizationId = orgRows[0]?.id;

   if (!organizationId) {
      throw new Error("ORGANIZATION_CREATE_FAILED");
   }

   await db.insert(organizationMembers).values({
      organizationId,
      userId: application.applicantUserId,
      role: "owner",
   });

   const updatedRows = await db
      .update(organizationApplications)
      .set({
         status: "approved",
         reviewedByUserId: params.reviewerUserId,
         reviewedAt: now,
         rejectionReason: null,
         organizationId,
         updatedAt: now,
      })
      .where(eq(organizationApplications.id, params.applicationId))
      .returning();

   return (updatedRows[0] as OrganizationApplication) ?? null;
}

export async function rejectOrganizationApplication(params: {
   applicationId: string;
   reviewerUserId: string;
   rejectionReason: string;
}) {
   const now = new Date();

   const existing = await getOrganizationApplicationById(params.applicationId);
   if (!existing) {
      return null;
   }

   if (!["submitted", "under_review"].includes(existing.status)) {
      throw new Error("INVALID_APPLICATION_STATE");
   }

   const result = await db
      .update(organizationApplications)
      .set({
         status: "rejected",
         reviewedByUserId: params.reviewerUserId,
         reviewedAt: now,
         rejectionReason: params.rejectionReason,
         updatedAt: now,
      })
      .where(eq(organizationApplications.id, params.applicationId))
      .returning();

   return (result[0] as OrganizationApplication) ?? null;
}

/**
 * Vrátí počet firemních žádostí čekajících na vyřízení
 * (stavy `submitted` a `under_review`).
 * @returns {Promise<number>} Počet čekajících žádostí.
 */
export async function countPendingOrganizationApplications(): Promise<number> {
   const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizationApplications)
      .where(
         inArray(organizationApplications.status, ["submitted", "under_review"]),
      );

   return Number(result[0]?.count ?? 0);
}

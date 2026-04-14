import { db } from "@/lib/db";
import { organizations, campaigns, organizationMembers } from "@/lib/schema";
import { eq, and, isNull, desc, sql, like, or } from "drizzle-orm";

const DEFAULT_ORGANIZATION_IMAGE_URL = "/globe.svg";

/**
 * Typ organizace
 */
export type Organization = {
   id: string;
   name: string;
   imageUrl: string;
   websiteUrl: string | null;
   email: string;
   phone: string;
   location: string;
   ico: string | null;
   verified: boolean;
   maxStorageBytes: number;
   usedStorageBytes: number;
   createdAt: Date;
   updatedAt: Date;
   deletedAt: Date | null;
};

/**
 * Typ organizace s počtem kampaní
 */
export type OrganizationWithCampaignCount = Organization & {
   activeCampaignsCount: number;
   totalCampaignsCount: number;
};

/**
 * Získání všech organizací
 */
export async function getAllOrganizations(): Promise<Organization[]> {
   const result = await db
      .select({
         id: organizations.id,
         name: organizations.name,
         imageUrl: organizations.imageUrl,
         websiteUrl: organizations.websiteUrl,
         email: organizations.email,
         phone: organizations.phone,
         location: organizations.location,
         ico: organizations.ico,
         verified: organizations.verified,
         maxStorageBytes: organizations.maxStorageBytes,
         usedStorageBytes: organizations.usedStorageBytes,
         createdAt: organizations.createdAt,
         updatedAt: organizations.updatedAt,
         deletedAt: organizations.deletedAt,
      })
      .from(organizations)
      .where(isNull(organizations.deletedAt))
      .orderBy(desc(organizations.createdAt));

   return result;
}

/**
 * Získání organizací s počtem kampaní
 */
export async function getOrganizationsWithCampaignCount(): Promise<
   OrganizationWithCampaignCount[]
> {
   const now = new Date();

   const result = await db
      .select({
         id: organizations.id,
         name: organizations.name,
         imageUrl: organizations.imageUrl,
         websiteUrl: organizations.websiteUrl,
         email: organizations.email,
         phone: organizations.phone,
         location: organizations.location,
         ico: organizations.ico,
         verified: organizations.verified,
         maxStorageBytes: organizations.maxStorageBytes,
         usedStorageBytes: organizations.usedStorageBytes,
         createdAt: organizations.createdAt,
         updatedAt: organizations.updatedAt,
         deletedAt: organizations.deletedAt,
         activeCampaignsCount: sql<number>`
        COUNT(CASE WHEN ${campaigns.deletedAt} IS NULL
          AND ${campaigns.startingAt} <= ${now}
          AND ${campaigns.endingAt} >= ${now}
        THEN 1 END)
      `.as("active_campaigns_count"),
         totalCampaignsCount: sql<number>`
        COUNT(CASE WHEN ${campaigns.deletedAt} IS NULL THEN 1 END)
      `.as("total_campaigns_count"),
      })
      .from(organizations)
      .leftJoin(campaigns, eq(organizations.id, campaigns.organizationId))
      .where(isNull(organizations.deletedAt))
      .groupBy(organizations.id)
      .orderBy(desc(organizations.createdAt));

   return result.map((org) => ({
      ...org,
      activeCampaignsCount: Number(org.activeCampaignsCount) || 0,
      totalCampaignsCount: Number(org.totalCampaignsCount) || 0,
   }));
}

/**
 * Získání organizace podle ID
 */
export async function getOrganizationById(
   organizationId: string,
): Promise<Organization | null> {
   const result = await db
      .select({
         id: organizations.id,
         name: organizations.name,
         imageUrl: organizations.imageUrl,
         websiteUrl: organizations.websiteUrl,
         email: organizations.email,
         phone: organizations.phone,
         location: organizations.location,
         ico: organizations.ico,
         verified: organizations.verified,
         maxStorageBytes: organizations.maxStorageBytes,
         usedStorageBytes: organizations.usedStorageBytes,
         createdAt: organizations.createdAt,
         updatedAt: organizations.updatedAt,
         deletedAt: organizations.deletedAt,
      })
      .from(organizations)
      .where(
         and(
            eq(organizations.id, organizationId),
            isNull(organizations.deletedAt),
         ),
      )
      .limit(1);

   return result[0] || null;
}

/**
 * Vytvoření nové organizace
 */
export async function createOrganization(data: {
   name: string;
   imageUrl?: string;
   websiteUrl?: string | null;
   email: string;
   phone: string;
   location: string;
   ico?: string | null;
   verified?: boolean;
   maxStorageBytes?: number;
}): Promise<Organization> {
   const result = await db
      .insert(organizations)
      .values({
         name: data.name,
         imageUrl: data.imageUrl || DEFAULT_ORGANIZATION_IMAGE_URL,
         websiteUrl: data.websiteUrl || null,
         email: data.email,
         phone: data.phone,
         location: data.location,
         ico: data.ico || null,
         verified: data.verified || false,
         maxStorageBytes: data.maxStorageBytes || 5368709120,
      })
      .returning({
         id: organizations.id,
         name: organizations.name,
         imageUrl: organizations.imageUrl,
         websiteUrl: organizations.websiteUrl,
         email: organizations.email,
         phone: organizations.phone,
         location: organizations.location,
         ico: organizations.ico,
         verified: organizations.verified,
         maxStorageBytes: organizations.maxStorageBytes,
         usedStorageBytes: organizations.usedStorageBytes,
         createdAt: organizations.createdAt,
         updatedAt: organizations.updatedAt,
         deletedAt: organizations.deletedAt,
      });

   return result[0];
}

/**
 * Aktualizace organizace
 */
export async function updateOrganization(
   organizationId: string,
   data: {
      name?: string;
      imageUrl?: string;
      websiteUrl?: string | null;
      email?: string;
      phone?: string;
      location?: string;
      ico?: string | null;
      verified?: boolean;
      maxStorageBytes?: number;
   },
): Promise<Organization | null> {
   const result = await db
      .update(organizations)
      .set({
         ...(data.name !== undefined && { name: data.name }),
         ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
         ...(data.websiteUrl !== undefined && { websiteUrl: data.websiteUrl }),
         ...(data.email !== undefined && { email: data.email }),
         ...(data.phone !== undefined && { phone: data.phone }),
         ...(data.location !== undefined && { location: data.location }),
         ...(data.ico !== undefined && { ico: data.ico }),
         ...(data.verified !== undefined && { verified: data.verified }),
         ...(data.maxStorageBytes !== undefined && {
            maxStorageBytes: data.maxStorageBytes,
         }),
         updatedAt: new Date(),
      })
      .where(
         and(
            eq(organizations.id, organizationId),
            isNull(organizations.deletedAt),
         ),
      )
      .returning({
         id: organizations.id,
         name: organizations.name,
         imageUrl: organizations.imageUrl,
         websiteUrl: organizations.websiteUrl,
         email: organizations.email,
         phone: organizations.phone,
         location: organizations.location,
         ico: organizations.ico,
         verified: organizations.verified,
         maxStorageBytes: organizations.maxStorageBytes,
         usedStorageBytes: organizations.usedStorageBytes,
         createdAt: organizations.createdAt,
         updatedAt: organizations.updatedAt,
         deletedAt: organizations.deletedAt,
      });

   return result[0] || null;
}

/**
 * Soft delete organizace
 */
export async function deleteOrganization(
   organizationId: string,
): Promise<boolean> {
   try {
      await db
         .update(organizations)
         .set({ deletedAt: new Date() })
         .where(eq(organizations.id, organizationId));
      return true;
   } catch (error) {
      console.error("Error deleting organization:", error);
      return false;
   }
}

/**
 * Vyhledávání organizací
 */
export async function searchOrganizations(
   query: string,
): Promise<Organization[]> {
   const searchPattern = `%${query}%`;

   const result = await db
      .select({
         id: organizations.id,
         name: organizations.name,
         imageUrl: organizations.imageUrl,
         websiteUrl: organizations.websiteUrl,
         email: organizations.email,
         phone: organizations.phone,
         location: organizations.location,
         ico: organizations.ico,
         verified: organizations.verified,
         maxStorageBytes: organizations.maxStorageBytes,
         usedStorageBytes: organizations.usedStorageBytes,
         createdAt: organizations.createdAt,
         updatedAt: organizations.updatedAt,
         deletedAt: organizations.deletedAt,
      })
      .from(organizations)
      .where(
         and(
            isNull(organizations.deletedAt),
            or(
               like(organizations.name, searchPattern),
               like(organizations.email, searchPattern),
               like(organizations.location, searchPattern),
            ),
         ),
      )
      .orderBy(desc(organizations.createdAt));

   return result;
}

/**
 * Zjistí, zda má uživatel aktivní členství ve schválené organizaci.
 * Bere v úvahu pouze organizace s onboardingStatus === "active"
 * (vyřazuje pending, suspended a smazané).
 * @param userId - ID uživatele.
 * @returns true pokud má uživatel alespoň jedno členství v aktivní organizaci.
 */
export async function hasActiveOrganizationMembership(
   userId: string,
): Promise<boolean> {
   const result = await db
      .select({ organizationId: organizationMembers.organizationId })
      .from(organizationMembers)
      .innerJoin(
         organizations,
         eq(organizationMembers.organizationId, organizations.id),
      )
      .where(
         and(
            eq(organizationMembers.userId, userId),
            eq(organizations.onboardingStatus, "active"),
            isNull(organizations.deletedAt),
         ),
      )
      .limit(1);

   return result.length > 0;
}

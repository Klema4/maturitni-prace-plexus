import { db } from "@/lib/db";
import { campaigns, organizations } from "@/lib/schema";
import { eq, and, isNull, desc, gte, lte, sql, like, or } from "drizzle-orm";

/**
 * Typ kampaně
 */
export type Campaign = {
  id: string;
  organizationId: string;
  stripeCampaignId: string | null;
  name: string;
  description: string | null;
  bannerImageUrl: string | null;
  bannerUrl: string | null;
  startingAt: Date;
  endingAt: Date;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

/**
 * Typ kampaně s organizací
 */
export type CampaignWithOrganization = Campaign & {
  organization: {
    id: string;
    name: string;
    imageUrl: string;
  };
};

export type PublicCampaignWithOrganization = Campaign & {
  organization: {
    id: string;
    name: string;
    imageUrl: string;
    websiteUrl: string | null;
  };
};

/**
 * Získání všech kampaní
 */
export async function getAllCampaigns(): Promise<Campaign[]> {
  const result = await db
    .select({
      id: campaigns.id,
      organizationId: campaigns.organizationId,
      stripeCampaignId: campaigns.stripeCampaignId,
      name: campaigns.name,
      description: campaigns.description,
      bannerImageUrl: campaigns.bannerImageUrl,
      bannerUrl: campaigns.bannerUrl,
      startingAt: campaigns.startingAt,
      endingAt: campaigns.endingAt,
      viewCount: campaigns.viewCount,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
      deletedAt: campaigns.deletedAt,
    })
    .from(campaigns)
    .where(isNull(campaigns.deletedAt))
    .orderBy(desc(campaigns.createdAt));

  return result;
}

/**
 * Získání kampaní s organizací
 */
export async function getCampaignsWithOrganization(): Promise<CampaignWithOrganization[]> {
  const result = await db
    .select({
      id: campaigns.id,
      organizationId: campaigns.organizationId,
      stripeCampaignId: campaigns.stripeCampaignId,
      name: campaigns.name,
      description: campaigns.description,
      bannerImageUrl: campaigns.bannerImageUrl,
      bannerUrl: campaigns.bannerUrl,
      startingAt: campaigns.startingAt,
      endingAt: campaigns.endingAt,
      viewCount: campaigns.viewCount,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
      deletedAt: campaigns.deletedAt,
      organization: {
        id: organizations.id,
        name: organizations.name,
        imageUrl: organizations.imageUrl,
      },
    })
    .from(campaigns)
    .innerJoin(organizations, eq(campaigns.organizationId, organizations.id))
    .where(
      and(
        isNull(campaigns.deletedAt),
        isNull(organizations.deletedAt)
      )
    )
    .orderBy(desc(campaigns.createdAt));

  return result;
}

/**
 * Získání kampaně podle ID
 */
export async function getCampaignById(
  campaignId: string
): Promise<Campaign | null> {
  const result = await db
    .select({
      id: campaigns.id,
      organizationId: campaigns.organizationId,
      stripeCampaignId: campaigns.stripeCampaignId,
      name: campaigns.name,
      description: campaigns.description,
      bannerImageUrl: campaigns.bannerImageUrl,
      bannerUrl: campaigns.bannerUrl,
      startingAt: campaigns.startingAt,
      endingAt: campaigns.endingAt,
      viewCount: campaigns.viewCount,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
      deletedAt: campaigns.deletedAt,
    })
    .from(campaigns)
    .where(
      and(
        eq(campaigns.id, campaignId),
        isNull(campaigns.deletedAt)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Získání aktivních kampaní
 */
export async function getActiveCampaigns(
  date: Date = new Date()
): Promise<CampaignWithOrganization[]> {
  const result = await db
    .select({
      id: campaigns.id,
      organizationId: campaigns.organizationId,
      stripeCampaignId: campaigns.stripeCampaignId,
      name: campaigns.name,
      description: campaigns.description,
      bannerImageUrl: campaigns.bannerImageUrl,
      bannerUrl: campaigns.bannerUrl,
      startingAt: campaigns.startingAt,
      endingAt: campaigns.endingAt,
      viewCount: campaigns.viewCount,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
      deletedAt: campaigns.deletedAt,
      organization: {
        id: organizations.id,
        name: organizations.name,
        imageUrl: organizations.imageUrl,
      },
    })
    .from(campaigns)
    .innerJoin(organizations, eq(campaigns.organizationId, organizations.id))
    .where(
      and(
        isNull(campaigns.deletedAt),
        isNull(organizations.deletedAt),
        lte(campaigns.startingAt, date),
        gte(campaigns.endingAt, date)
      )
    )
    .orderBy(desc(campaigns.createdAt));

  return result;
}

export async function getActiveCampaignsForPublicDisplay(
  date: Date = new Date()
): Promise<PublicCampaignWithOrganization[]> {
  const result = await db
    .select({
      id: campaigns.id,
      organizationId: campaigns.organizationId,
      stripeCampaignId: campaigns.stripeCampaignId,
      name: campaigns.name,
      description: campaigns.description,
      bannerImageUrl: campaigns.bannerImageUrl,
      bannerUrl: campaigns.bannerUrl,
      startingAt: campaigns.startingAt,
      endingAt: campaigns.endingAt,
      viewCount: campaigns.viewCount,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
      deletedAt: campaigns.deletedAt,
      organization: {
        id: organizations.id,
        name: organizations.name,
        imageUrl: organizations.imageUrl,
        websiteUrl: organizations.websiteUrl,
      },
    })
    .from(campaigns)
    .innerJoin(organizations, eq(campaigns.organizationId, organizations.id))
    .where(
      and(
        isNull(campaigns.deletedAt),
        isNull(organizations.deletedAt),
        lte(campaigns.startingAt, date),
        gte(campaigns.endingAt, date)
      )
    )
    .orderBy(desc(campaigns.createdAt));

  return result;
}

/**
 * Získání plánovaných kampaní
 */
export async function getPlannedCampaigns(
  date: Date = new Date()
): Promise<CampaignWithOrganization[]> {
  const result = await db
    .select({
      id: campaigns.id,
      organizationId: campaigns.organizationId,
      stripeCampaignId: campaigns.stripeCampaignId,
      name: campaigns.name,
      description: campaigns.description,
      bannerImageUrl: campaigns.bannerImageUrl,
      bannerUrl: campaigns.bannerUrl,
      startingAt: campaigns.startingAt,
      endingAt: campaigns.endingAt,
      viewCount: campaigns.viewCount,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
      deletedAt: campaigns.deletedAt,
      organization: {
        id: organizations.id,
        name: organizations.name,
        imageUrl: organizations.imageUrl,
      },
    })
    .from(campaigns)
    .innerJoin(organizations, eq(campaigns.organizationId, organizations.id))
    .where(
      and(
        isNull(campaigns.deletedAt),
        isNull(organizations.deletedAt),
        gte(campaigns.startingAt, date)
      )
    )
    .orderBy(campaigns.startingAt);

  return result;
}

/**
 * Získání kampaní podle organizace
 */
export async function getCampaignsByOrganizationId(
  organizationId: string
): Promise<Campaign[]> {
  const result = await db
    .select({
      id: campaigns.id,
      organizationId: campaigns.organizationId,
      stripeCampaignId: campaigns.stripeCampaignId,
      name: campaigns.name,
      description: campaigns.description,
      bannerImageUrl: campaigns.bannerImageUrl,
      bannerUrl: campaigns.bannerUrl,
      startingAt: campaigns.startingAt,
      endingAt: campaigns.endingAt,
      viewCount: campaigns.viewCount,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
      deletedAt: campaigns.deletedAt,
    })
    .from(campaigns)
    .where(
      and(
        eq(campaigns.organizationId, organizationId),
        isNull(campaigns.deletedAt)
      )
    )
    .orderBy(desc(campaigns.createdAt));

  return result;
}

/**
 * Vytvoření nové kampaně
 */
export async function createCampaign(data: {
  organizationId: string;
  stripeCampaignId?: string | null;
  name: string;
  description?: string | null;
  bannerImageUrl?: string | null;
  bannerUrl?: string | null;
  startingAt: Date;
  endingAt: Date;
}): Promise<Campaign> {
  const result = await db
    .insert(campaigns)
    .values({
      organizationId: data.organizationId,
      stripeCampaignId: data.stripeCampaignId || null,
      name: data.name,
      description: data.description || null,
      bannerImageUrl: data.bannerImageUrl || null,
      bannerUrl: data.bannerUrl || null,
      startingAt: data.startingAt,
      endingAt: data.endingAt,
    })
    .returning({
      id: campaigns.id,
      organizationId: campaigns.organizationId,
      stripeCampaignId: campaigns.stripeCampaignId,
      name: campaigns.name,
      description: campaigns.description,
      bannerImageUrl: campaigns.bannerImageUrl,
      bannerUrl: campaigns.bannerUrl,
      startingAt: campaigns.startingAt,
      endingAt: campaigns.endingAt,
      viewCount: campaigns.viewCount,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
      deletedAt: campaigns.deletedAt,
    });

  return result[0];
}

/**
 * Aktualizace kampaně
 */
export async function updateCampaign(
  campaignId: string,
  data: {
    name?: string;
    description?: string | null;
    bannerImageUrl?: string | null;
    bannerUrl?: string | null;
    startingAt?: Date;
    endingAt?: Date;
  }
): Promise<Campaign | null> {
  const result = await db
    .update(campaigns)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.bannerImageUrl !== undefined && { bannerImageUrl: data.bannerImageUrl }),
      ...(data.bannerUrl !== undefined && { bannerUrl: data.bannerUrl }),
      ...(data.startingAt !== undefined && { startingAt: data.startingAt }),
      ...(data.endingAt !== undefined && { endingAt: data.endingAt }),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(campaigns.id, campaignId),
        isNull(campaigns.deletedAt)
      )
    )
    .returning({
      id: campaigns.id,
      organizationId: campaigns.organizationId,
      stripeCampaignId: campaigns.stripeCampaignId,
      name: campaigns.name,
      description: campaigns.description,
      bannerImageUrl: campaigns.bannerImageUrl,
      bannerUrl: campaigns.bannerUrl,
      startingAt: campaigns.startingAt,
      endingAt: campaigns.endingAt,
      viewCount: campaigns.viewCount,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
      deletedAt: campaigns.deletedAt,
    });

  return result[0] || null;
}

/**
 * Inkrementace počtu zobrazení kampaně
 */
export async function incrementCampaignViewCount(
  campaignId: string
): Promise<void> {
  await db
    .update(campaigns)
    .set({
      viewCount: sql`${campaigns.viewCount} + 1`,
    })
    .where(eq(campaigns.id, campaignId));
}

/**
 * Soft delete kampaně
 */
export async function deleteCampaign(campaignId: string): Promise<boolean> {
  try {
    await db
      .update(campaigns)
      .set({ deletedAt: new Date() })
      .where(eq(campaigns.id, campaignId));
    return true;
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return false;
  }
}

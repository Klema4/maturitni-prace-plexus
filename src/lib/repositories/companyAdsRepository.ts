import { db } from "@/lib/db";
import {
  campaigns,
  organizationInvites,
  organizationMembers,
  organizations,
  users,
} from "@/lib/schema";
import { and, asc, desc, eq, gt, isNull, sql } from "drizzle-orm";

export type CompanyAdsRole = "owner" | "manager" | "viewer";
export type CompanyInviteStatus = "pending" | "accepted" | "revoked" | "expired";
export type CompanyOnboardingStatus = "pending" | "active" | "suspended";

export type CompanyAdsOrganization = {
  id: string;
  name: string;
  imageUrl: string;
  websiteUrl: string | null;
  email: string;
  phone: string;
  location: string;
  ico: string | null;
  verified: boolean;
  onboardingStatus: CompanyOnboardingStatus;
  approvedAt: Date | null;
  approvedByUserId: string | null;
  maxStorageBytes: number;
  usedStorageBytes: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

export type CompanyAdsAccessibleOrganization = CompanyAdsOrganization & {
  role: CompanyAdsRole;
  memberCreatedAt: Date;
};

export type CompanyAdsMembership = {
  organizationId: string;
  userId: string;
  role: CompanyAdsRole;
  createdAt: Date;
  organization: CompanyAdsOrganization;
};

export type CompanyAdsMember = {
  organizationId: string;
  userId: string;
  role: CompanyAdsRole;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
    image: string | null;
    isBanned: boolean;
    emailVerified: boolean;
    createdAt: Date;
  };
};

export type CompanyAdsInvite = {
  id: string;
  organizationId: string;
  email: string;
  role: CompanyAdsRole;
  invitedByUserId: string;
  token: string;
  status: CompanyInviteStatus;
  expiresAt: Date;
  acceptedByUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CompanyAdsCampaign = {
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
  organization: {
    id: string;
    name: string;
    imageUrl: string;
  };
};

export type CompanyAdsOverviewStats = {
  totalCampaigns: number;
  activeCampaigns: number;
  plannedCampaigns: number;
  finishedCampaigns: number;
  totalViews: number;
  membersCount: number;
  pendingInvitesCount: number;
};

function organizationSelect() {
  return {
    id: organizations.id,
    name: organizations.name,
    imageUrl: organizations.imageUrl,
    websiteUrl: organizations.websiteUrl,
    email: organizations.email,
    phone: organizations.phone,
    location: organizations.location,
    ico: organizations.ico,
    verified: organizations.verified,
    onboardingStatus: organizations.onboardingStatus,
    approvedAt: organizations.approvedAt,
    approvedByUserId: organizations.approvedByUserId,
    maxStorageBytes: organizations.maxStorageBytes,
    usedStorageBytes: organizations.usedStorageBytes,
    createdAt: organizations.createdAt,
    updatedAt: organizations.updatedAt,
    deletedAt: organizations.deletedAt,
  };
}

function campaignSelect() {
  return {
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
  };
}

export async function getUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      surname: users.surname,
      email: users.email,
      image: users.image,
      isBanned: users.isBanned,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(and(eq(users.email, normalizedEmail), isNull(users.deletedAt)))
    .limit(1);

  return result[0] ?? null;
}

export async function listOrganizationsForUser(
  userId: string,
): Promise<CompanyAdsAccessibleOrganization[]> {
  return await db
    .select({
      ...organizationSelect(),
      role: organizationMembers.role,
      memberCreatedAt: organizationMembers.createdAt,
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizations.onboardingStatus, "active"),
        isNull(organizations.deletedAt),
      ),
    )
    .orderBy(asc(organizations.name), asc(organizationMembers.createdAt));
}

export async function getOrganizationMembershipForUser(
  userId: string,
  organizationId: string,
): Promise<CompanyAdsMembership | null> {
  const result = await db
    .select({
      organizationId: organizationMembers.organizationId,
      userId: organizationMembers.userId,
      role: organizationMembers.role,
      createdAt: organizationMembers.createdAt,
      organization: organizationSelect(),
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId),
        eq(organizations.onboardingStatus, "active"),
        isNull(organizations.deletedAt),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

export async function listOrganizationMembers(
  organizationId: string,
): Promise<CompanyAdsMember[]> {
  return await db
    .select({
      organizationId: organizationMembers.organizationId,
      userId: organizationMembers.userId,
      role: organizationMembers.role,
      createdAt: organizationMembers.createdAt,
      user: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        email: users.email,
        image: users.image,
        isBanned: users.isBanned,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
      },
    })
    .from(organizationMembers)
    .innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id))
    .innerJoin(users, eq(organizationMembers.userId, users.id))
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizations.onboardingStatus, "active"),
        isNull(organizations.deletedAt),
        isNull(users.deletedAt),
      ),
    )
    .orderBy(asc(organizationMembers.role), asc(users.name), asc(users.surname));
}

export async function addOrganizationMember(params: {
  organizationId: string;
  userId: string;
  role: CompanyAdsRole;
}) {
  const result = await db
    .insert(organizationMembers)
    .values({
      organizationId: params.organizationId,
      userId: params.userId,
      role: params.role,
    })
    .returning();

  return result[0] ?? null;
}

export async function updateOrganizationMemberRole(params: {
  organizationId: string;
  userId: string;
  role: CompanyAdsRole;
}) {
  const result = await db
    .update(organizationMembers)
    .set({ role: params.role })
    .where(
      and(
        eq(organizationMembers.organizationId, params.organizationId),
        eq(organizationMembers.userId, params.userId),
      ),
    )
    .returning();

  return result[0] ?? null;
}

export async function removeOrganizationMember(params: {
  organizationId: string;
  userId: string;
}) {
  const result = await db
    .delete(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, params.organizationId),
        eq(organizationMembers.userId, params.userId),
      ),
    )
    .returning();

  return result[0] ?? null;
}

export async function countOrganizationOwners(organizationId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.role, "owner"),
      ),
    );

  return Number(result[0]?.count ?? 0);
}

export async function listCampaignsByOrganizationForMember(
  organizationId: string,
): Promise<CompanyAdsCampaign[]> {
  return await db
    .select(campaignSelect())
    .from(campaigns)
    .innerJoin(organizations, eq(campaigns.organizationId, organizations.id))
    .where(
      and(
        eq(campaigns.organizationId, organizationId),
        eq(organizations.onboardingStatus, "active"),
        isNull(organizations.deletedAt),
        isNull(campaigns.deletedAt),
      ),
    )
    .orderBy(desc(campaigns.createdAt));
}

export async function getCampaignByIdForOrganization(
  organizationId: string,
  campaignId: string,
): Promise<CompanyAdsCampaign | null> {
  const result = await db
    .select(campaignSelect())
    .from(campaigns)
    .innerJoin(organizations, eq(campaigns.organizationId, organizations.id))
    .where(
      and(
        eq(campaigns.organizationId, organizationId),
        eq(campaigns.id, campaignId),
        eq(organizations.onboardingStatus, "active"),
        isNull(organizations.deletedAt),
        isNull(campaigns.deletedAt),
      ),
    )
    .limit(1);

  return result[0] ?? null;
}

export async function getOrganizationOverviewStats(
  organizationId: string,
): Promise<CompanyAdsOverviewStats> {
  const now = new Date();

  const [campaignStats, membersStats, invitesStats] = await Promise.all([
    db
      .select({
        totalCampaigns: sql<number>`count(*)::int`,
        activeCampaigns: sql<number>`count(*) filter (where ${campaigns.startingAt} <= ${now} and ${campaigns.endingAt} >= ${now})::int`,
        plannedCampaigns: sql<number>`count(*) filter (where ${campaigns.startingAt} > ${now})::int`,
        finishedCampaigns: sql<number>`count(*) filter (where ${campaigns.endingAt} < ${now})::int`,
        totalViews: sql<number>`coalesce(sum(${campaigns.viewCount}), 0)::int`,
      })
      .from(campaigns)
      .where(and(eq(campaigns.organizationId, organizationId), isNull(campaigns.deletedAt))),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizationMembers)
      .where(eq(organizationMembers.organizationId, organizationId)),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(organizationInvites)
      .where(
        and(
          eq(organizationInvites.organizationId, organizationId),
          eq(organizationInvites.status, "pending"),
          gt(organizationInvites.expiresAt, now),
        ),
      ),
  ]);

  return {
    totalCampaigns: Number(campaignStats[0]?.totalCampaigns ?? 0),
    activeCampaigns: Number(campaignStats[0]?.activeCampaigns ?? 0),
    plannedCampaigns: Number(campaignStats[0]?.plannedCampaigns ?? 0),
    finishedCampaigns: Number(campaignStats[0]?.finishedCampaigns ?? 0),
    totalViews: Number(campaignStats[0]?.totalViews ?? 0),
    membersCount: Number(membersStats[0]?.count ?? 0),
    pendingInvitesCount: Number(invitesStats[0]?.count ?? 0),
  };
}

export async function listPendingOrganizationInvites(
  organizationId: string,
  limit?: number,
): Promise<CompanyAdsInvite[]> {
  const query = db
    .select({
      id: organizationInvites.id,
      organizationId: organizationInvites.organizationId,
      email: organizationInvites.email,
      role: organizationInvites.role,
      invitedByUserId: organizationInvites.invitedByUserId,
      token: organizationInvites.token,
      status: organizationInvites.status,
      expiresAt: organizationInvites.expiresAt,
      acceptedByUserId: organizationInvites.acceptedByUserId,
      createdAt: organizationInvites.createdAt,
      updatedAt: organizationInvites.updatedAt,
    })
    .from(organizationInvites)
    .where(eq(organizationInvites.organizationId, organizationId))
    .orderBy(desc(organizationInvites.createdAt))
    .$dynamic();

  const rows = limit ? await query.limit(limit) : await query;

  return rows as CompanyAdsInvite[];
}

export async function getPendingOrganizationInviteByOrganizationAndEmail(
  organizationId: string,
  email: string,
): Promise<CompanyAdsInvite | null> {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await db
    .select()
    .from(organizationInvites)
    .where(
      and(
        eq(organizationInvites.organizationId, organizationId),
        eq(organizationInvites.email, normalizedEmail),
        eq(organizationInvites.status, "pending"),
      ),
    )
    .orderBy(desc(organizationInvites.createdAt))
    .limit(1);

  return (result[0] as CompanyAdsInvite | undefined) ?? null;
}

export async function createOrganizationInvite(params: {
  organizationId: string;
  email: string;
  role: CompanyAdsRole;
  invitedByUserId: string;
  token: string;
  expiresAt: Date;
}) {
  const result = await db
    .insert(organizationInvites)
    .values({
      organizationId: params.organizationId,
      email: params.email.trim().toLowerCase(),
      role: params.role,
      invitedByUserId: params.invitedByUserId,
      token: params.token,
      expiresAt: params.expiresAt,
    })
    .returning();

  return (result[0] as CompanyAdsInvite | undefined) ?? null;
}

export async function getOrganizationInviteByToken(
  token: string,
): Promise<CompanyAdsInvite | null> {
  const result = await db
    .select()
    .from(organizationInvites)
    .where(eq(organizationInvites.token, token))
    .limit(1);

  return (result[0] as CompanyAdsInvite | undefined) ?? null;
}

export async function markOrganizationInviteAccepted(params: {
  inviteId: string;
  acceptedByUserId: string;
}) {
  const result = await db
    .update(organizationInvites)
    .set({
      status: "accepted",
      acceptedByUserId: params.acceptedByUserId,
      updatedAt: new Date(),
    })
    .where(eq(organizationInvites.id, params.inviteId))
    .returning();

  return (result[0] as CompanyAdsInvite | undefined) ?? null;
}

export async function markOrganizationInviteExpired(inviteId: string) {
  const result = await db
    .update(organizationInvites)
    .set({
      status: "expired",
      updatedAt: new Date(),
    })
    .where(eq(organizationInvites.id, inviteId))
    .returning();

  return (result[0] as CompanyAdsInvite | undefined) ?? null;
}

export async function getOrganizationByIdForCompanyAds(
  organizationId: string,
): Promise<CompanyAdsOrganization | null> {
  const result = await db
    .select(organizationSelect())
    .from(organizations)
    .where(and(eq(organizations.id, organizationId), isNull(organizations.deletedAt)))
    .limit(1);

  return result[0] ?? null;
}

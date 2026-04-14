import { randomBytes } from "crypto";
import {
  createCampaign,
  deleteCampaign,
  updateCampaign,
} from "@/lib/repositories/campaignsRepository";
import {
  addOrganizationMember,
  countOrganizationOwners,
  createOrganizationInvite,
  getCampaignByIdForOrganization,
  getOrganizationByIdForCompanyAds,
  getOrganizationInviteByToken,
  getOrganizationMembershipForUser,
  getOrganizationOverviewStats,
  getUserByEmail,
  listCampaignsByOrganizationForMember,
  listOrganizationMembers,
  listOrganizationsForUser,
  listPendingOrganizationInvites,
  markOrganizationInviteAccepted,
  markOrganizationInviteExpired,
  removeOrganizationMember,
  updateOrganizationMemberRole,
} from "@/lib/repositories/companyAdsRepository";
import { getUserById } from "@/lib/repositories/userRepository";
import { updateOrganization } from "@/lib/repositories/organizationsRepository";
import {
  AcceptCompanyAdsInviteSchema,
  CreateCompanyAdsCampaignSchema,
  CreateCompanyAdsInviteSchema,
  ManageableCompanyAdsRole,
  UpdateCompanyAdsCampaignSchema,
  UpdateCompanyAdsMemberRoleSchema,
  UpdateCompanyAdsSettingsSchema,
} from "@/lib/schemas/companyAdsSchema";
import { sendEmailWithPlunk } from "@/lib/services/emailService";
import {
  getPlunkApiKeyForOrganization,
  getPlunkFromEmailForOrganization,
} from "@/lib/services/plunkApiKeyService";

const ESTIMATED_ACTIVE_CAMPAIGN_COST_CZK = 5000;
const INVITE_TTL_DAYS = 7;

type CompanyAdsRole = "owner" | "manager" | "viewer";

type ResolveCompanyAdsContextInput = {
  preferredOrganizationId?: string | null;
  cookieOrganizationId?: string | null;
};

export class CompanyAdsUnauthorizedError extends Error {
  constructor() {
    super("Nejste přihlášeni");
    this.name = "CompanyAdsUnauthorizedError";
  }
}

export class CompanyAdsAccessError extends Error {
  constructor(message: string = "K této firmě nemáte přístup") {
    super(message);
    this.name = "CompanyAdsAccessError";
  }
}

export class CompanyAdsManageError extends Error {
  constructor(message: string = "Na tuto akci nemáte oprávnění") {
    super(message);
    this.name = "CompanyAdsManageError";
  }
}

export class CompanyAdsNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CompanyAdsNotFoundError";
  }
}

export class CompanyAdsConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CompanyAdsConflictError";
  }
}

export class CompanyAdsValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CompanyAdsValidationError";
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function canManage(role: CompanyAdsRole) {
  return role === "owner" || role === "manager";
}

async function requireMembership(userId: string, organizationId: string) {
  const membership = await getOrganizationMembershipForUser(userId, organizationId);

  if (!membership) {
    throw new CompanyAdsAccessError();
  }

  return membership;
}

async function requireManageMembership(userId: string, organizationId: string) {
  const membership = await requireMembership(userId, organizationId);

  if (!canManage(membership.role)) {
    throw new CompanyAdsManageError();
  }

  return membership;
}

async function expireStalePendingInvites(organizationId: string) {
  const invites = await listPendingOrganizationInvites(organizationId);
  const now = new Date();

  await Promise.all(
    invites
      .filter((invite) => invite.status === "pending" && invite.expiresAt <= now)
      .map((invite) => markOrganizationInviteExpired(invite.id)),
  );
}

export async function resolveCompanyAdsContextService(
  userId: string,
  input: ResolveCompanyAdsContextInput = {},
) {
  const organizations = await listOrganizationsForUser(userId);

  if (organizations.length === 0) {
    throw new CompanyAdsAccessError(
      "Pro přístup k reklamnímu dashboardu potřebujete schválenou firemní registraci.",
    );
  }

  const requestedId = input.preferredOrganizationId || input.cookieOrganizationId || null;
  const activeOrganization =
    organizations.find((organization) => organization.id === requestedId) ?? organizations[0];

  return {
    organizations,
    activeOrganization,
    role: activeOrganization.role,
    canManage: canManage(activeOrganization.role),
  };
}

export async function getCompanyAdsOverviewService(
  userId: string,
  organizationId: string,
) {
  const membership = await requireMembership(userId, organizationId);
  await expireStalePendingInvites(organizationId);

  const [stats, campaigns, members, pendingInvites] = await Promise.all([
    getOrganizationOverviewStats(organizationId),
    listCampaignsByOrganizationForMember(organizationId),
    listOrganizationMembers(organizationId),
    listPendingOrganizationInvites(organizationId, 5),
  ]);

  const now = new Date();
  const upcomingCampaigns = campaigns
    .filter((campaign) => new Date(campaign.startingAt).getTime() > now.getTime())
    .sort(
      (a, b) =>
        new Date(a.startingAt).getTime() - new Date(b.startingAt).getTime(),
    )
    .slice(0, 5);

  return {
    organization: membership.organization,
    role: membership.role,
    canManage: canManage(membership.role),
    stats,
    upcomingCampaigns,
    membersPreview: members.slice(0, 4),
    pendingInvites: pendingInvites.filter((invite) => invite.status === "pending"),
    estimatedMonthlySpend: stats.activeCampaigns * ESTIMATED_ACTIVE_CAMPAIGN_COST_CZK,
  };
}

export async function listCompanyAdsCampaignsService(
  userId: string,
  organizationId: string,
) {
  const membership = await requireMembership(userId, organizationId);
  const campaigns = await listCampaignsByOrganizationForMember(organizationId);

  return {
    organization: membership.organization,
    role: membership.role,
    canManage: canManage(membership.role),
    campaigns,
  };
}

export async function createCompanyAdsCampaignService(
  userId: string,
  organizationId: string,
  data: unknown,
) {
  await requireManageMembership(userId, organizationId);
  const payload = CreateCompanyAdsCampaignSchema.parse(data);

  await createCampaign({
    organizationId,
    name: payload.name,
    description: payload.description,
    bannerImageUrl: payload.bannerImageUrl,
    bannerUrl: payload.bannerUrl,
    startingAt: new Date(payload.startingAt),
    endingAt: new Date(payload.endingAt),
  });

  const campaigns = await listCampaignsByOrganizationForMember(organizationId);
  return campaigns[0] ?? null;
}

export async function updateCompanyAdsCampaignService(
  userId: string,
  organizationId: string,
  campaignId: string,
  data: unknown,
) {
  await requireManageMembership(userId, organizationId);
  const existing = await getCampaignByIdForOrganization(organizationId, campaignId);

  if (!existing) {
    throw new CompanyAdsNotFoundError("Kampaň nebyla nalezena");
  }

  const payload = UpdateCompanyAdsCampaignSchema.parse(data);
  const updated = await updateCampaign(campaignId, {
    name: payload.name,
    description: payload.description,
    bannerImageUrl: payload.bannerImageUrl,
    bannerUrl: payload.bannerUrl,
    startingAt: payload.startingAt ? new Date(payload.startingAt) : undefined,
    endingAt: payload.endingAt ? new Date(payload.endingAt) : undefined,
  });

  if (!updated) {
    throw new CompanyAdsNotFoundError("Kampaň nebyla nalezena");
  }

  return await getCampaignByIdForOrganization(organizationId, campaignId);
}

export async function deleteCompanyAdsCampaignService(
  userId: string,
  organizationId: string,
  campaignId: string,
) {
  await requireManageMembership(userId, organizationId);
  const existing = await getCampaignByIdForOrganization(organizationId, campaignId);

  if (!existing) {
    throw new CompanyAdsNotFoundError("Kampaň nebyla nalezena");
  }

  const success = await deleteCampaign(campaignId);

  if (!success) {
    throw new CompanyAdsValidationError("Kampaň se nepodařilo odstranit");
  }

  return { success: true };
}

export async function getCompanyAdsCalendarService(
  userId: string,
  organizationId: string,
  rangeDays: number,
) {
  const membership = await requireMembership(userId, organizationId);
  const campaigns = await listCampaignsByOrganizationForMember(organizationId);
  const today = new Date();
  const end = new Date();
  end.setDate(end.getDate() + rangeDays);

  const timeline = campaigns
    .filter((campaign) => {
      const start = new Date(campaign.startingAt);
      const finish = new Date(campaign.endingAt);
      return finish >= today && start <= end;
    })
    .sort(
      (a, b) =>
        new Date(a.startingAt).getTime() - new Date(b.startingAt).getTime(),
    );

  return {
    organization: membership.organization,
    role: membership.role,
    timeline,
  };
}

export async function getCompanyAdsAnalyticsService(
  userId: string,
  organizationId: string,
) {
  const membership = await requireMembership(userId, organizationId);
  const campaigns = await listCampaignsByOrganizationForMember(organizationId);
  const stats = await getOrganizationOverviewStats(organizationId);

  const topCampaigns = campaigns
    .slice()
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  return {
    organization: membership.organization,
    role: membership.role,
    stats,
    topCampaigns,
  };
}

export async function getCompanyAdsBillingService(
  userId: string,
  organizationId: string,
) {
  const membership = await requireMembership(userId, organizationId);
  const campaigns = await listCampaignsByOrganizationForMember(organizationId);
  const now = new Date();
  const activeCampaigns = campaigns.filter((campaign) => {
    const start = new Date(campaign.startingAt);
    const end = new Date(campaign.endingAt);
    return start <= now && end >= now;
  });

  return {
    organization: membership.organization,
    role: membership.role,
    activeCampaigns,
    estimatedMonthlySpend: activeCampaigns.length * ESTIMATED_ACTIVE_CAMPAIGN_COST_CZK,
    pricingNote: "MVP billing přehled pro firemní dashboard. Nejde o ostrou fakturaci.",
    supportEmail: "support@plexus.cz",
  };
}

export async function getCompanyAdsMembersService(
  userId: string,
  organizationId: string,
) {
  const membership = await requireMembership(userId, organizationId);
  await expireStalePendingInvites(organizationId);

  const [members, pendingInvites] = await Promise.all([
    listOrganizationMembers(organizationId),
    listPendingOrganizationInvites(organizationId),
  ]);

  return {
    organization: membership.organization,
    role: membership.role,
    canManage: canManage(membership.role),
    members,
    pendingInvites: pendingInvites.filter((invite) => invite.status === "pending"),
  };
}

export async function inviteCompanyAdsMemberService(
  userId: string,
  organizationId: string,
  data: unknown,
) {
  const membership = await requireManageMembership(userId, organizationId);
  const payload = CreateCompanyAdsInviteSchema.parse(data);
  const normalizedEmail = normalizeEmail(payload.email);

  await expireStalePendingInvites(organizationId);

  const [members, existingInvite, existingUser] = await Promise.all([
    listOrganizationMembers(organizationId),
    listPendingOrganizationInvites(organizationId),
    getUserByEmail(normalizedEmail),
  ]);

  if (
    members.some((member) => normalizeEmail(member.user.email) === normalizedEmail)
  ) {
    throw new CompanyAdsConflictError("Tento uživatel už je členem firmy");
  }

  if (
    existingInvite.some(
      (invite) =>
        invite.status === "pending" && normalizeEmail(invite.email) === normalizedEmail,
    )
  ) {
    throw new CompanyAdsConflictError("Pro tento email už čeká aktivní pozvánka");
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  const invite = await createOrganizationInvite({
    organizationId,
    email: normalizedEmail,
    role: payload.role,
    invitedByUserId: userId,
    token,
    expiresAt,
  });

  if (!invite) {
    throw new CompanyAdsValidationError("Pozvánku se nepodařilo vytvořit");
  }

  const siteUrl = (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
  const inviteUrl = `${siteUrl}/firmy/pozvanka?token=${token}`;
  const accountHint = existingUser
    ? "Přihlaste se ke svému účtu Plexus a pozvánku potvrďte."
    : "Vytvořte si účet v Plexus se stejným emailem a potom pozvánku potvrďte.";

  const emailBody = `<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charSet="UTF-8" />
    <title>Pozvánka do firemního dashboardu Plexus</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;">
    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:600px;background-color:#ffffff;border-radius:16px;padding:24px;border:1px solid #e5e7eb;">
            <tr>
              <td style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#111827;">Pozvánka do firemního dashboardu Plexus</h1>
                <p style="margin:0 0 16px;font-size:14px;color:#111827;">Dobrý den,</p>
                <p style="margin:0 0 16px;font-size:14px;color:#111827;">
                  byli jste pozváni do firmy <strong>${membership.organization.name}</strong> jako <strong>${payload.role}</strong>.
                </p>
                <p style="margin:0 0 16px;font-size:14px;color:#111827;">${accountHint}</p>
                <p style="margin:0 0 24px;">
                  <a href="${inviteUrl}" style="display:inline-block;padding:10px 18px;border-radius:9999px;background-color:#111827;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;">
                    Otevřít pozvánku
                  </a>
                </p>
                <p style="margin:0 0 16px;font-size:13px;color:#4b5563;">Pokud tlačítko nefunguje, použijte tento odkaz:</p>
                <p style="margin:0 0 24px;font-size:12px;color:#4b5563;word-break:break-all;">${inviteUrl}</p>
                <p style="margin:0;font-size:14px;color:#111827;">S pozdravem,<br />tým Plexus</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const [plunkApiKey, plunkFromEmail] = await Promise.all([
    getPlunkApiKeyForOrganization(organizationId),
    getPlunkFromEmailForOrganization(organizationId),
  ]);

  void sendEmailWithPlunk({
    to: normalizedEmail,
    subject: `Pozvánka do firmy ${membership.organization.name} v Plexus`,
    body: emailBody,
    apiKey: plunkApiKey ?? undefined,
    fromEmail: plunkFromEmail ?? undefined,
  });

  return invite;
}

export async function acceptCompanyAdsInviteService(
  userId: string,
  token: string,
) {
  const payload = AcceptCompanyAdsInviteSchema.parse({ token });
  const invite = await getOrganizationInviteByToken(payload.token);

  if (!invite) {
    throw new CompanyAdsNotFoundError("Pozvánka nebyla nalezena");
  }

  if (invite.status !== "pending") {
    throw new CompanyAdsConflictError("Tato pozvánka už byla zpracována");
  }

  if (invite.expiresAt <= new Date()) {
    await markOrganizationInviteExpired(invite.id);
    throw new CompanyAdsConflictError("Platnost této pozvánky už vypršela");
  }

  const [user, organization, existingMembership] = await Promise.all([
    getUserById(userId),
    getOrganizationByIdForCompanyAds(invite.organizationId),
    getOrganizationMembershipForUser(userId, invite.organizationId),
  ]);

  if (!user) {
    throw new CompanyAdsUnauthorizedError();
  }

  if (normalizeEmail(user.email) !== normalizeEmail(invite.email)) {
    throw new CompanyAdsAccessError(
      "Pozvánka je vázaná na jinou emailovou adresu, než kterou má váš účet.",
    );
  }

  if (!organization || organization.deletedAt || organization.onboardingStatus !== "active") {
    throw new CompanyAdsNotFoundError("Firma už není dostupná");
  }

  if (!existingMembership) {
    await addOrganizationMember({
      organizationId: invite.organizationId,
      userId,
      role: invite.role,
    });
  }

  await markOrganizationInviteAccepted({
    inviteId: invite.id,
    acceptedByUserId: userId,
  });

  return {
    organizationId: invite.organizationId,
    role: invite.role,
    alreadyMember: Boolean(existingMembership),
  };
}

export async function updateCompanyAdsMemberRoleService(
  userId: string,
  organizationId: string,
  data: unknown,
) {
  const membership = await requireManageMembership(userId, organizationId);
  const payload = UpdateCompanyAdsMemberRoleSchema.parse(data);
  const members = await listOrganizationMembers(organizationId);
  const targetMember = members.find((member) => member.userId === payload.userId);

  if (!targetMember) {
    throw new CompanyAdsNotFoundError("Člen firmy nebyl nalezen");
  }

  if (targetMember.role === "owner") {
    if (membership.role !== "owner") {
      throw new CompanyAdsManageError("Ownera může upravit jen owner firmy");
    }

    const ownersCount = await countOrganizationOwners(organizationId);
    if (ownersCount <= 1) {
      throw new CompanyAdsConflictError("Posledního ownera nelze degradovat");
    }
  }

  const updated = await updateOrganizationMemberRole({
    organizationId,
    userId: payload.userId,
    role: payload.role as ManageableCompanyAdsRole,
  });

  if (!updated) {
    throw new CompanyAdsValidationError("Roli se nepodařilo změnit");
  }

  return await getCompanyAdsMembersService(userId, organizationId);
}

export async function removeCompanyAdsMemberService(
  userId: string,
  organizationId: string,
  memberUserId: string,
) {
  const membership = await requireManageMembership(userId, organizationId);
  const members = await listOrganizationMembers(organizationId);
  const targetMember = members.find((member) => member.userId === memberUserId);

  if (!targetMember) {
    throw new CompanyAdsNotFoundError("Člen firmy nebyl nalezen");
  }

  if (targetMember.role === "owner") {
    if (membership.role !== "owner") {
      throw new CompanyAdsManageError("Ownera může odebrat jen owner firmy");
    }

    const ownersCount = await countOrganizationOwners(organizationId);
    if (ownersCount <= 1) {
      throw new CompanyAdsConflictError("Posledního ownera nelze odebrat");
    }
  }

  const removed = await removeOrganizationMember({
    organizationId,
    userId: memberUserId,
  });

  if (!removed) {
    throw new CompanyAdsValidationError("Člena firmy se nepodařilo odebrat");
  }

  return { success: true };
}

export async function getCompanyAdsSettingsService(
  userId: string,
  organizationId: string,
) {
  const membership = await requireMembership(userId, organizationId);

  return {
    organization: membership.organization,
    role: membership.role,
    canManage: canManage(membership.role),
  };
}

export async function updateCompanyAdsSettingsService(
  userId: string,
  organizationId: string,
  data: unknown,
) {
  await requireManageMembership(userId, organizationId);
  const payload = UpdateCompanyAdsSettingsSchema.parse(data);

  const updated = await updateOrganization(organizationId, {
    name: payload.name,
    imageUrl: payload.imageUrl,
    websiteUrl: payload.websiteUrl,
    email: payload.email,
    phone: payload.phone,
    location: payload.location,
    ico: payload.ico,
  });

  if (!updated) {
    throw new CompanyAdsNotFoundError("Firmu se nepodařilo uložit");
  }

  return updated;
}





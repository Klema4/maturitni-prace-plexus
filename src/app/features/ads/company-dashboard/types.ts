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
  role: CompanyAdsRole;
};

export type CompanyAdsContextResponse = {
  organizations: CompanyAdsOrganization[];
  activeOrganization: CompanyAdsOrganization;
  role: CompanyAdsRole;
  canManage: boolean;
};

export type CompanyAdsCampaign = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  bannerImageUrl: string | null;
  bannerUrl: string | null;
  startingAt: string;
  endingAt: string;
  viewCount: number;
  organization: {
    id: string;
    name: string;
    imageUrl: string;
  };
};

export type CompanyAdsMember = {
  organizationId: string;
  userId: string;
  role: CompanyAdsRole;
  createdAt: string;
  user: {
    id: string;
    name: string;
    surname: string;
    email: string;
    image: string | null;
    isBanned: boolean;
    emailVerified: boolean;
    createdAt: string;
  };
};

export type CompanyAdsInvite = {
  id: string;
  organizationId: string;
  email: string;
  role: CompanyAdsRole;
  status: CompanyInviteStatus;
  expiresAt: string;
  createdAt: string;
};

export type CompanyAdsOverviewResponse = {
  organization: CompanyAdsOrganization;
  role: CompanyAdsRole;
  canManage: boolean;
  stats: {
    totalCampaigns: number;
    activeCampaigns: number;
    plannedCampaigns: number;
    finishedCampaigns: number;
    totalViews: number;
    membersCount: number;
    pendingInvitesCount: number;
  };
  upcomingCampaigns: CompanyAdsCampaign[];
  membersPreview: CompanyAdsMember[];
  pendingInvites: CompanyAdsInvite[];
  estimatedMonthlySpend: number;
};

export type CompanyAdsAnalyticsResponse = {
  organization: CompanyAdsOrganization;
  role: CompanyAdsRole;
  stats: CompanyAdsOverviewResponse["stats"];
  topCampaigns: CompanyAdsCampaign[];
};

export type CompanyAdsBillingResponse = {
  organization: CompanyAdsOrganization;
  role: CompanyAdsRole;
  activeCampaigns: CompanyAdsCampaign[];
  estimatedMonthlySpend: number;
  pricingNote: string;
  supportEmail: string;
};

export type CompanyAdsMembersResponse = {
  organization: CompanyAdsOrganization;
  role: CompanyAdsRole;
  canManage: boolean;
  members: CompanyAdsMember[];
  pendingInvites: CompanyAdsInvite[];
};

export type CompanyAdsSettingsResponse = {
  organization: CompanyAdsOrganization;
  role: CompanyAdsRole;
  canManage: boolean;
};

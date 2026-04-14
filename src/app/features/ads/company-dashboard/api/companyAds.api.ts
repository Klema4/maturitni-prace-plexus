import {
  dashboardFetch,
  dashboardFetchOrThrow,
  parseDashboardError,
} from "@/utils/dashboardFetch";
import type {
  CompanyAdsAnalyticsResponse,
  CompanyAdsBillingResponse,
  CompanyAdsCampaign,
  CompanyAdsContextResponse,
  CompanyAdsMembersResponse,
  CompanyAdsOverviewResponse,
  CompanyAdsSettingsResponse,
  CompanyAdsRole,
} from "../types";

export async function getCompanyAdsContext(companyId?: string | null) {
  const query = companyId ? `?companyId=${encodeURIComponent(companyId)}` : "";
  const response = await dashboardFetchOrThrow(`/api/companies/ads/context${query}`);
  return (await response.json()) as CompanyAdsContextResponse;
}

export async function getCompanyAdsOverview(organizationId: string) {
  const response = await dashboardFetchOrThrow(
    `/api/companies/ads/overview?organizationId=${encodeURIComponent(organizationId)}`,
  );
  return (await response.json()) as CompanyAdsOverviewResponse;
}

export async function getCompanyAdsAnalytics(organizationId: string) {
  const response = await dashboardFetchOrThrow(
    `/api/companies/ads/analytics?organizationId=${encodeURIComponent(organizationId)}`,
  );
  return (await response.json()) as CompanyAdsAnalyticsResponse;
}

export async function getCompanyAdsBilling(organizationId: string) {
  const response = await dashboardFetchOrThrow(
    `/api/companies/ads/billing?organizationId=${encodeURIComponent(organizationId)}`,
  );
  return (await response.json()) as CompanyAdsBillingResponse;
}

export async function listCompanyAdsCampaigns(organizationId: string) {
  const response = await dashboardFetchOrThrow(
    `/api/companies/ads/campaigns?organizationId=${encodeURIComponent(organizationId)}`,
  );
  return (await response.json()) as {
    role: CompanyAdsRole;
    canManage: boolean;
    campaigns: CompanyAdsCampaign[];
  };
}

export async function saveCompanyAdsCampaign(
  organizationId: string,
  method: "POST" | "PATCH",
  body: Record<string, unknown>,
) {
  const response = await dashboardFetch(
    `/api/companies/ads/campaigns?organizationId=${encodeURIComponent(organizationId)}`,
    {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    await parseDashboardError(response);
  }

  return response;
}

export async function deleteCompanyAdsCampaign(
  organizationId: string,
  campaignId: string,
) {
  const response = await dashboardFetch(
    `/api/companies/ads/campaigns?organizationId=${encodeURIComponent(organizationId)}&id=${encodeURIComponent(campaignId)}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    await parseDashboardError(response);
  }
}

export async function getCompanyAdsMembers(organizationId: string) {
  const response = await dashboardFetchOrThrow(
    `/api/companies/ads/members?organizationId=${encodeURIComponent(organizationId)}`,
  );
  return (await response.json()) as CompanyAdsMembersResponse;
}

export async function inviteCompanyAdsMember(
  organizationId: string,
  email: string,
  role: Exclude<CompanyAdsRole, "owner">,
) {
  const response = await dashboardFetch("/api/companies/ads/invitations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ organizationId, email, role }),
  });

  if (!response.ok) {
    await parseDashboardError(response);
  }
}

export async function updateCompanyAdsMemberRole(
  organizationId: string,
  userId: string,
  role: Exclude<CompanyAdsRole, "owner">,
) {
  const response = await dashboardFetch(
    `/api/companies/ads/members?organizationId=${encodeURIComponent(organizationId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    },
  );

  if (!response.ok) {
    await parseDashboardError(response);
  }
}

export async function removeCompanyAdsMember(
  organizationId: string,
  userId: string,
) {
  const response = await dashboardFetch(
    `/api/companies/ads/members?organizationId=${encodeURIComponent(organizationId)}&userId=${encodeURIComponent(userId)}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    await parseDashboardError(response);
  }
}

export async function getCompanyAdsSettings(organizationId: string) {
  const response = await dashboardFetchOrThrow(
    `/api/companies/ads/settings?organizationId=${encodeURIComponent(organizationId)}`,
  );
  return (await response.json()) as CompanyAdsSettingsResponse;
}

export async function updateCompanyAdsSettings(
  organizationId: string,
  body: Record<string, unknown>,
) {
  const response = await dashboardFetch(
    `/api/companies/ads/settings?organizationId=${encodeURIComponent(organizationId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    await parseDashboardError(response);
  }
}

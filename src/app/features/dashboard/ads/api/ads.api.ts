import { apiFetch, apiFetchOrThrow, parseApiError } from "@/lib/utils/api";
import type {
  AdminCampaign,
  AdminOrganization,
  AdminOrganizationApplication,
  AdminRegistrationStatus,
} from "../types";

export async function listAdminCampaigns() {
  const response = await apiFetchOrThrow("/api/dashboard/campaigns");
  const json = await response.json();
  return (json.campaigns ?? []) as AdminCampaign[];
}

export async function saveAdminCampaign(body: Record<string, unknown>) {
  const response = await apiFetch("/api/dashboard/campaigns", {
    method: body.id ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

export async function deleteAdminCampaign(campaignId: string) {
  const response = await apiFetch(`/api/dashboard/campaigns?id=${campaignId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

export async function listAdminOrganizations(withCampaigns = false) {
  const query = withCampaigns ? "?withCampaigns=true" : "";
  const response = await apiFetchOrThrow(`/api/dashboard/organizations${query}`);
  const json = await response.json();
  return (json.organizations ?? []) as AdminOrganization[];
}

export async function saveAdminOrganization(body: Record<string, unknown>) {
  const response = await apiFetch("/api/dashboard/organizations", {
    method: body.id ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

export async function deleteAdminOrganization(organizationId: string) {
  const response = await apiFetch(
    `/api/dashboard/organizations?id=${organizationId}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    await parseApiError(response);
  }
}

export async function listAdminRegistrations(
  status: AdminRegistrationStatus | "all" = "submitted",
) {
  const params = new URLSearchParams();
  if (status !== "all") {
    params.set("status", status);
  }

  const query = params.toString();
  const response = await apiFetchOrThrow(
    `/api/dashboard/ads/registrations${query ? `?${query}` : ""}`,
  );
  const json = await response.json();
  return (json.applications ?? []) as AdminOrganizationApplication[];
}

export async function approveAdminRegistration(registrationId: string) {
  const response = await apiFetch(
    `/api/dashboard/ads/registrations/${registrationId}/approve`,
    { method: "POST" },
  );

  if (!response.ok) {
    await parseApiError(response);
  }
}

export async function rejectAdminRegistration(
  registrationId: string,
  rejectionReason: string,
) {
  const response = await apiFetch(
    `/api/dashboard/ads/registrations/${registrationId}/reject`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rejectionReason }),
    },
  );

  if (!response.ok) {
    await parseApiError(response);
  }
}

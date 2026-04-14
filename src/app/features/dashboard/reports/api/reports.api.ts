import { apiFetch, apiFetchOrThrow, parseApiError } from "@/lib/utils/api";
import type { Report, ReportStatus } from "../types";

type ListDashboardReportsParams = {
  status?: ReportStatus | "all";
  limit?: number;
  offset?: number;
  sortOrder?: "newest" | "oldest";
};

/**
 * Sestaví query string pro endpoint `/api/dashboard/reports`.
 *
 * @param {ListDashboardReportsParams} params - Parametry listování reportů.
 * @returns {string} Query string bez úvodního `?` (nebo prázdný string).
 */
function buildDashboardReportsQuery(params: ListDashboardReportsParams): string {
  const searchParams = new URLSearchParams();
  if (params.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }
  if (typeof params.limit === "number") {
    searchParams.set("limit", String(params.limit));
  }
  if (typeof params.offset === "number") {
    searchParams.set("offset", String(params.offset));
  }
  if (params.sortOrder) {
    searchParams.set("sortOrder", params.sortOrder);
  }
  return searchParams.toString();
}

export async function listDashboardReports(params: ListDashboardReportsParams = {}) {
  const query = buildDashboardReportsQuery(params);
  const url = query ? `/api/dashboard/reports?${query}` : "/api/dashboard/reports";
  const response = await apiFetchOrThrow(url);
  const json = await response.json();
  return (json.reports ?? []) as Report[];
}

export async function updateDashboardReport(
  reportId: string,
  action: "resolve" | "dismiss",
) {
  const response = await apiFetch("/api/dashboard/reports", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reportId, action }),
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

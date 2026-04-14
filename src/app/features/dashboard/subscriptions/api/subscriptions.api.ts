import { apiFetch, apiFetchOrThrow, parseApiError } from "@/lib/utils/api";
import type {
  Subscription,
  SubscriptionFilterType,
  SubscriptionStats,
} from "../types";

export async function listDashboardSubscriptions(
  type: SubscriptionFilterType = "all",
) {
  const typeParam = type === "all" ? "" : `?type=${type}`;
  const response = await apiFetchOrThrow(
    `/api/dashboard/subscriptions${typeParam}`,
  );
  const json = await response.json();
  return (json.subscriptions ?? []) as Subscription[];
}

export async function getDashboardSubscriptionStats() {
  const response = await apiFetchOrThrow(
    "/api/dashboard/subscriptions?stats=true",
  );
  const json = await response.json();
  return (json.stats ?? { active: 0, expired: 0, total: 0 }) as SubscriptionStats;
}

export async function deleteDashboardSubscription(userId: string) {
  const response = await apiFetch(
    `/api/dashboard/subscriptions?userId=${userId}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    await parseApiError(response);
  }
}

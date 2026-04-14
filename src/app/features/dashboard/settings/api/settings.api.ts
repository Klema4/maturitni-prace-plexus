import { apiFetch, apiFetchOrThrow, parseApiError } from "@/lib/utils/api";
import type {
  DashboardSettings,
  DashboardSettingsPatch,
} from "../types";

export async function getDashboardSettings() {
  const response = await apiFetchOrThrow("/api/dashboard/settings");
  const json = await response.json();
  return json.settings as DashboardSettings | null;
}

export async function updateDashboardSettings(
  body: DashboardSettingsPatch,
) {
  const response = await apiFetch("/api/dashboard/settings", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  const json = await response.json();
  return json.settings as DashboardSettings;
}

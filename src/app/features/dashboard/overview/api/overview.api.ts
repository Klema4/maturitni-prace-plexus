import { apiFetchOrThrow } from "@/lib/utils/api";
import type { OverviewChartPoint, OverviewStats } from "../types";

export async function getOverviewStats() {
  const response = await apiFetchOrThrow("/api/dashboard/stats?type=overview");
  const json = await response.json();
  return json.stats as OverviewStats;
}

export async function getOverviewChartData(url: string) {
  const response = await apiFetchOrThrow(url);
  const json = await response.json();
  return (json.data ?? []) as OverviewChartPoint[];
}

import { apiFetchOrThrow } from "@/lib/utils/api";
import type {
  AnalyticsChartPoint,
  AnalyticsStats,
  TopArticleRow,
} from "../types";

export async function getAnalyticsStats() {
  const response = await apiFetchOrThrow("/api/dashboard/stats?type=analytics");
  const json = await response.json();
  return json.stats as AnalyticsStats;
}

export async function getAnalyticsChartData(url: string) {
  const response = await apiFetchOrThrow(url);
  const json = await response.json();
  return (json.data ?? []) as AnalyticsChartPoint[];
}

export async function getAnalyticsTopArticles() {
  const response = await apiFetchOrThrow(
    "/api/dashboard/stats?type=top-articles&limit=8",
  );
  const json = await response.json();
  return (json.data ?? []) as TopArticleRow[];
}

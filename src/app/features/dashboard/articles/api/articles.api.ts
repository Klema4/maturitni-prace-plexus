import { apiFetch, apiFetchOrThrow, parseApiError } from "@/lib/utils/api";
import type {
  ArticlePayload,
  ArticleTag,
  DashboardArticle,
} from "@/app/features/dashboard/articles/types";

interface CreatedDashboardArticle {
  id: string;
  slug: string;
}

export async function listDashboardArticles() {
  const response = await apiFetchOrThrow("/api/dashboard/articles");
  const json = await response.json();
  return (json.articles ?? []) as DashboardArticle[];
}

export async function listDashboardArticleTags() {
  const response = await apiFetchOrThrow("/api/dashboard/tags");
  const json = await response.json();
  return (json.tags ?? []) as ArticleTag[];
}

export async function createDashboardArticle(body: ArticlePayload) {
  const response = await apiFetch("/api/dashboard/articles/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  const json = await response.json();
  return json.article as CreatedDashboardArticle;
}

export async function getDashboardArticle(articleId: string) {
  const response = await apiFetchOrThrow(`/api/dashboard/articles/${articleId}`);
  const json = await response.json();
  return json.article as DashboardArticle;
}

export async function updateDashboardArticle(
  articleId: string,
  body: ArticlePayload,
) {
  const response = await apiFetch(`/api/dashboard/articles/${articleId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

export async function deleteDashboardArticle(articleId: string) {
  const response = await apiFetch(
    `/api/dashboard/articles?articleId=${articleId}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    await parseApiError(response);
  }
}

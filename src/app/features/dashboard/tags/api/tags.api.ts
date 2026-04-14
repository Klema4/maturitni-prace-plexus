import { apiFetch, apiFetchOrThrow, parseApiError } from "@/lib/utils/api";
import type { Tag, TagPayload } from "../types";

export async function listDashboardTags() {
  const response = await apiFetchOrThrow("/api/dashboard/tags");
  const json = await response.json();
  return (json.tags ?? []) as Tag[];
}

export async function createDashboardTag(body: TagPayload) {
  const response = await apiFetch("/api/dashboard/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  const json = await response.json();
  return json.tag as Tag;
}

export async function updateDashboardTag(id: string, body: TagPayload) {
  const response = await apiFetch("/api/dashboard/tags", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...body }),
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  const json = await response.json();
  return json.tag as Tag;
}

export async function deleteDashboardTag(id: string) {
  const response = await apiFetch(`/api/dashboard/tags?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

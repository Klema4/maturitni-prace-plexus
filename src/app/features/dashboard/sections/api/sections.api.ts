import { apiFetch, apiFetchOrThrow, parseApiError } from "@/lib/utils/api";
import type { Section, SectionPayload, SectionTag } from "../types";

export async function listDashboardSections() {
  const response = await apiFetchOrThrow("/api/dashboard/sections");
  const json = await response.json();
  return (json.sections ?? []) as Section[];
}

export async function listDashboardSectionTags() {
  const response = await apiFetchOrThrow("/api/dashboard/tags");
  const json = await response.json();
  return (json.tags ?? []) as SectionTag[];
}

export async function createDashboardSection(body: SectionPayload) {
  const response = await apiFetch("/api/dashboard/sections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  const json = await response.json();
  return json.section as Section;
}

export async function updateDashboardSection(id: string, body: SectionPayload) {
  const response = await apiFetch("/api/dashboard/sections", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...body }),
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  const json = await response.json();
  return json.section as Section;
}

export async function deleteDashboardSection(id: string) {
  const response = await apiFetch(`/api/dashboard/sections?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

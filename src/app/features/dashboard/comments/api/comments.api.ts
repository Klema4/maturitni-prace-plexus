import { apiFetch, apiFetchOrThrow, parseApiError } from "@/lib/utils/api";
import type { DashboardComment } from "../types";

type ListDashboardCommentsParams = {
  limit?: number;
  offset?: number;
  query?: string;
};

/**
 * Načte komentáře pro dashboard (všechny napříč platformou).
 */
export async function listDashboardComments(params: ListDashboardCommentsParams = {}) {
  const searchParams = new URLSearchParams();
  if (typeof params.limit === "number") {
    searchParams.set("limit", String(params.limit));
  }
  if (typeof params.offset === "number") {
    searchParams.set("offset", String(params.offset));
  }
  if (params.query?.trim()) {
    searchParams.set("q", params.query.trim());
  }

  const queryString = searchParams.toString();
  const url = queryString ? `/api/dashboard/comments?${queryString}` : "/api/dashboard/comments";
  const response = await apiFetchOrThrow(url);
  const json = await response.json();
  return {
    items: (json.comments ?? []) as DashboardComment[],
    total: Number(json.total ?? 0),
  };
}

/**
 * Načte detail komentáře pro dashboard (pro modaly/reporty).
 */
export async function getDashboardComment(commentId: string) {
  const response = await apiFetchOrThrow(`/api/dashboard/comments/${commentId}`);
  const json = await response.json();
  return json.comment as DashboardComment;
}

export async function hideComment(commentId: string, reason: string) {
  const response = await apiFetch(`/api/comments/${commentId}/hide`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

export async function unhideComment(commentId: string) {
  const response = await apiFetch(`/api/comments/${commentId}/unhide`, {
    method: "POST",
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

export async function banCommentAuthor(userId: string) {
  const response = await apiFetch(`/api/dashboard/users/${userId}/ban`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ban: true }),
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

export async function editCommentAsAdmin(commentId: string, content: string) {
  const response = await apiFetch(`/api/comments/${commentId}/admin-edit`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

export async function deleteComment(commentId: string) {
  const response = await apiFetch(`/api/comments/${commentId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

import { apiFetch, apiFetchOrThrow, parseApiError } from "@/lib/utils/api";
import type {
  PermissionRole,
  PermissionRolePayload,
} from "../types";

export async function listPermissionRoles() {
  const response = await apiFetchOrThrow("/api/dashboard/permissions");
  const json = await response.json();
  return (json.roles ?? []) as PermissionRole[];
}

export async function createPermissionRole(body: PermissionRolePayload) {
  const response = await apiFetch("/api/dashboard/permissions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

export async function updatePermissionRole(
  id: string,
  body: PermissionRolePayload | Pick<PermissionRole, "weight">,
) {
  const response = await apiFetch("/api/dashboard/permissions", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...body }),
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

export async function deletePermissionRole(id: string) {
  const response = await apiFetch(`/api/dashboard/permissions?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

export async function updatePermissionRoleWeights(
  updates: Array<{ id: string; weight: number }>,
) {
  await Promise.all(
    updates.map((update) => updatePermissionRole(update.id, { weight: update.weight })),
  );
}

import { apiFetch, apiFetchOrThrow, parseApiError } from "@/lib/utils/api";
import type { RedactionMember, RedactionRole, RedactionUser } from "../types";

export async function listRedactionMembers() {
  const response = await apiFetchOrThrow("/api/dashboard/redaction");
  const json = await response.json();
  return (json.members ?? []) as RedactionMember[];
}

export async function listRedactionRoles() {
  const response = await apiFetchOrThrow("/api/dashboard/redaction?roles=true");
  const json = await response.json();
  return (json.roles ?? []) as RedactionRole[];
}

export async function listRedactionUsers() {
  const response = await apiFetchOrThrow("/api/dashboard/users");
  const json = await response.json();
  return (json.users ?? []) as RedactionUser[];
}

export async function addRedactionRole(userId: string, roleId: string) {
  const response = await apiFetch("/api/dashboard/redaction", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, roleId }),
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

export async function removeRedactionRole(userId: string, roleId: string) {
  const response = await apiFetch(
    `/api/dashboard/redaction?userId=${userId}&roleId=${roleId}`,
    { method: "DELETE" },
  );

  if (!response.ok) {
    await parseApiError(response);
  }
}

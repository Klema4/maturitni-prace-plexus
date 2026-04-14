import { apiFetch, apiFetchOrThrow, parseApiError } from "@/lib/utils/api";
import type { DashboardUser, Role } from "../types";

/**
 * API klient pro získání uživatelů pro dashboard.
 * @param {string} [query] - Volitelný vyhledávací dotaz.
 * @returns {Promise<DashboardUser[]>} Seznam uživatelů.
 */
export async function listDashboardUsers(query?: string) {
  const url = query
    ? `/api/dashboard/users?query=${encodeURIComponent(query)}`
    : "/api/dashboard/users";
  const response = await apiFetchOrThrow(url);
  const json = await response.json();
  return (json.users ?? []) as DashboardUser[];
}

/**
 * API klient pro získání dostupných rolí uživatelů pro dashboard.
 * @returns {Promise<Role[]>} Seznam rolí.
 */
export async function listDashboardUserRoles() {
  const response = await apiFetchOrThrow("/api/dashboard/users/roles");
  const json = await response.json();
  return (json.roles ?? []) as Role[];
}

/**
 * Aktualizace role uživatele v dashboardu.
 * @param {string} userId - ID uživatele.
 * @param {string} roleId - ID role.
 * @param {boolean} add - Zda roli přidat (true) nebo odebrat (false).
 * @returns {Promise<void>}
 */
export async function updateDashboardUserRole(
  userId: string,
  roleId: string,
  add: boolean,
) {
  const response = await apiFetch(`/api/dashboard/users/${userId}/role`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roleId, add }),
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

/**
 * Zabanování nebo odzabanování uživatele v dashboardu.
 * @param {string} userId - ID uživatele.
 * @param {boolean} ban - Zda uživatele zabanovat (true) nebo odzabanovat (false).
 * @returns {Promise<void>}
 */
export async function updateDashboardUserBan(userId: string, ban: boolean) {
  const response = await apiFetch(`/api/dashboard/users/${userId}/ban`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ban }),
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

/**
 * Aktualizace storage kvóty uživatele v dashboardu.
 * @param {string} userId - ID uživatele.
 * @param {number} maxStorageBytes - Nová kvóta v bajtech.
 * @returns {Promise<void>}
 */
export async function updateDashboardUserQuota(
  userId: string,
  maxStorageBytes: number,
) {
  const response = await apiFetch(`/api/dashboard/users/${userId}/quota`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ maxStorageBytes }),
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

/**
 * Aktualizace základních informací o uživateli v dashboardu.
 * @param {Object} params - Parametry pro aktualizaci.
 * @param {string} params.userId - ID uživatele.
 * @param {string} params.name - Jméno uživatele.
 * @param {string} params.surname - Příjmení uživatele.
 * @param {string} params.email - Email uživatele.
 * @returns {Promise<void>}
 */
export async function updateDashboardUserInfo(params: {
  userId: string;
  name: string;
  surname: string;
  email: string;
}) {
  const response = await apiFetch(
    `/api/dashboard/users/${params.userId}/info`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: params.name,
        surname: params.surname,
        email: params.email,
      }),
    },
  );

  if (!response.ok) {
    await parseApiError(response);
  }
}

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  listDashboardUserRoles,
  listDashboardUsers,
  updateDashboardUserBan,
  updateDashboardUserQuota,
  updateDashboardUserRole,
  updateDashboardUserInfo,
} from "../api/users.api";
import type { DashboardUser, Role } from "../types";

export function useUsersPage() {
  const [users, setUsers] = useState<DashboardUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);

  const fetchUsers = useCallback(async (query?: string) => {
    try {
      setLoading(true);

      const [usersData, rolesData] = await Promise.all([
        listDashboardUsers(query),
        listDashboardUserRoles(),
      ]);

      setUsers(usersData);
      setRoles(rolesData);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Nastala chyba");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  const openSearchModal = useCallback(() => {
    setShowSearchModal(true);
  }, []);

  const closeSearchModal = useCallback(() => {
    setShowSearchModal(false);
  }, []);

  const handleSearch = useCallback(async () => {
    const normalizedQuery = searchQuery.trim();
    await fetchUsers(normalizedQuery || undefined);
    setShowSearchModal(false);
  }, [fetchUsers, searchQuery]);

  const handleClearSearch = useCallback(async () => {
    setSearchQuery("");
    await fetchUsers();
    setShowSearchModal(false);
  }, [fetchUsers]);

  const handleRoleChange = useCallback(
    async (userId: string, roleId: string, add: boolean) => {
      await updateDashboardUserRole(userId, roleId, add);
      await fetchUsers(searchQuery || undefined);
    },
    [fetchUsers, searchQuery],
  );

  const handleBanToggle = useCallback(
    async (userId: string, ban: boolean) => {
      await updateDashboardUserBan(userId, ban);
      await fetchUsers(searchQuery || undefined);
    },
    [fetchUsers, searchQuery],
  );

  const handleQuotaChange = useCallback(
    async (userId: string, maxStorageBytes: number) => {
      await updateDashboardUserQuota(userId, maxStorageBytes);
      await fetchUsers(searchQuery || undefined);
    },
    [fetchUsers, searchQuery],
  );

  const handleUpdateUserInfo = useCallback(
    async (userId: string, data: { name: string; surname: string; email: string }) => {
      await updateDashboardUserInfo({
        userId,
        name: data.name,
        surname: data.surname,
        email: data.email,
      });
      await fetchUsers(searchQuery || undefined);
    },
    [fetchUsers, searchQuery],
  );

  return {
    users,
    roles,
    loading,
    error,
    searchQuery,
    showSearchModal,
    setSearchQuery,
    openSearchModal,
    closeSearchModal,
    handleSearch,
    handleClearSearch,
    handleRoleChange,
    handleBanToggle,
    handleQuotaChange,
    handleUpdateUserInfo,
  };
}

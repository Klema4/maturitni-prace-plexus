"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addRedactionRole,
  listRedactionMembers,
  listRedactionRoles,
  listRedactionUsers,
  removeRedactionRole,
} from "../api/redaction.api";
import type {
  RedactionMember,
  RedactionRole,
  RedactionUser,
} from "../types";

type RedactionFormState = {
  userId: string;
  roleId: string;
};

const initialFormState: RedactionFormState = {
  userId: "",
  roleId: "",
};

export function useRedactionPage() {
  const [members, setMembers] = useState<RedactionMember[]>([]);
  const [allUsers, setAllUsers] = useState<RedactionUser[]>([]);
  const [roles, setRoles] = useState<RedactionRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<RedactionMember | null>(
    null,
  );
  const [formData, setFormData] = useState(initialFormState);

  const reloadMembers = useCallback(async () => {
    setMembers(await listRedactionMembers());
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [membersData, rolesData, usersData] = await Promise.all([
          listRedactionMembers(),
          listRedactionRoles(),
          listRedactionUsers(),
        ]);

        setMembers(membersData);
        setRoles(rolesData);
        setAllUsers(usersData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Nastala chyba");
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, []);

  const updateFormField = useCallback(
    <TKey extends keyof RedactionFormState>(
      field: TKey,
      value: RedactionFormState[TKey],
    ) => {
      setFormData((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const closeAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    setFormData(initialFormState);
  }, []);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setEditingMember(null);
    setFormData(initialFormState);
  }, []);

  const handleOpenAddModal = useCallback(() => {
    setFormData(initialFormState);
    setIsAddModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((member: RedactionMember) => {
    setEditingMember(member);
    setFormData(initialFormState);
    setIsEditModalOpen(true);
  }, []);

  const handleAddRole = useCallback(async () => {
    try {
      await addRedactionRole(formData.userId, formData.roleId);
      await reloadMembers();
      closeAddModal();
    } catch (saveError) {
      alert(saveError instanceof Error ? saveError.message : "Nastala chyba");
    }
  }, [closeAddModal, formData.roleId, formData.userId, reloadMembers]);

  const handleRemoveRole = useCallback(
    async (userId: string, roleId: string) => {
      if (!confirm("Opravdu chcete odebrat tuto roli?")) {
        return;
      }

      try {
        await removeRedactionRole(userId, roleId);
        await reloadMembers();
      } catch (deleteError) {
        alert(
          deleteError instanceof Error ? deleteError.message : "Nastala chyba",
        );
      }
    },
    [reloadMembers],
  );

  const handleAddRoleToEditingMember = useCallback(async () => {
    if (!editingMember || !formData.roleId) {
      return;
    }

    try {
      await addRedactionRole(editingMember.id, formData.roleId);
      await reloadMembers();
      setFormData(initialFormState);
    } catch (saveError) {
      alert(saveError instanceof Error ? saveError.message : "Nastala chyba");
    }
  }, [editingMember, formData.roleId, reloadMembers]);

  return {
    members,
    allUsers,
    roles,
    loading,
    error,
    isAddModalOpen,
    isEditModalOpen,
    editingMember,
    formData,
    updateFormField,
    closeAddModal,
    closeEditModal,
    handleOpenAddModal,
    handleOpenEditModal,
    handleAddRole,
    handleRemoveRole,
    handleAddRoleToEditingMember,
  };
}

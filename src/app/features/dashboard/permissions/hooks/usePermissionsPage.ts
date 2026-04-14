"use client";

import { useCallback, useEffect, useState } from "react";
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  createPermissionRole,
  deletePermissionRole,
  listPermissionRoles,
  updatePermissionRole,
  updatePermissionRoleWeights,
} from "../api/permissions.api";
import type { PermissionRole } from "../types";

const initialRoleFormData = {
  name: "",
  color: "#FFFFFF",
  weight: 0,
};

export function usePermissionsPage() {
  const [roles, setRoles] = useState<PermissionRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<PermissionRole | null>(null);
  const [roleFormData, setRoleFormData] = useState(initialRoleFormData);
  const [rolePermissions, setRolePermissions] = useState<bigint>(() => BigInt(0));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const reloadRoles = useCallback(async () => {
    setRoles(await listPermissionRoles());
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        setRoles(await listPermissionRoles());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Nastala chyba");
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return;
      }

      const oldIndex = roles.findIndex((role) => role.id === active.id);
      const newIndex = roles.findIndex((role) => role.id === over.id);
      const newRoles = arrayMove(roles, oldIndex, newIndex);
      setRoles(newRoles);

      const updates = newRoles.map((role, index) => ({
        id: role.id,
        weight: newRoles.length - index,
      }));

      try {
        await updatePermissionRoleWeights(updates);
      } catch (sortError) {
        console.error("Chyba při aktualizaci pořadí rolí:", sortError);
        await reloadRoles();
      }
    },
    [reloadRoles, roles],
  );

  const closeRoleModal = useCallback(() => {
    setIsRoleModalOpen(false);
    setEditingRole(null);
    setRoleFormData(initialRoleFormData);
    setRolePermissions(BigInt(0));
  }, []);

  const handleOpenRoleModal = useCallback((role?: PermissionRole) => {
    if (role) {
      setEditingRole(role);
      setRoleFormData({
        name: role.name,
        color: role.color,
        weight: role.weight,
      });
      setRolePermissions(BigInt(role.permissions || "0"));
    } else {
      setEditingRole(null);
      setRoleFormData(initialRoleFormData);
      setRolePermissions(BigInt(0));
    }

    setIsRoleModalOpen(true);
  }, []);

  const updateRoleFormField = useCallback(
    <TKey extends keyof typeof initialRoleFormData>(
      field: TKey,
      value: (typeof initialRoleFormData)[TKey],
    ) => {
      setRoleFormData((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const handleSaveRole = useCallback(async () => {
    try {
      if (editingRole) {
        await updatePermissionRole(editingRole.id, {
          ...roleFormData,
          permissions: rolePermissions.toString(),
        });
      } else {
        await createPermissionRole({
          ...roleFormData,
          permissions: rolePermissions.toString(),
        });
      }

      await reloadRoles();
      closeRoleModal();
    } catch (saveError) {
      alert(saveError instanceof Error ? saveError.message : "Nastala chyba");
    }
  }, [closeRoleModal, editingRole, reloadRoles, roleFormData, rolePermissions]);

  const handleDeleteRole = useCallback(
    async (roleId: string) => {
      if (!confirm("Opravdu chcete smazat tuto roli?")) {
        return;
      }

      try {
        await deletePermissionRole(roleId);
        await reloadRoles();
      } catch (deleteError) {
        alert(
          deleteError instanceof Error ? deleteError.message : "Nastala chyba",
        );
      }
    },
    [reloadRoles],
  );

  return {
    roles,
    loading,
    error,
    isRoleModalOpen,
    editingRole,
    roleFormData,
    rolePermissions,
    sensors,
    setRolePermissions,
    updateRoleFormField,
    closeRoleModal,
    handleOpenRoleModal,
    handleDragEnd,
    handleSaveRole,
    handleDeleteRole,
  };
}

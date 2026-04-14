"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteAdminOrganization,
  listAdminOrganizations,
  saveAdminOrganization,
} from "../../api/ads.api";
import type { AdminOrganization } from "../../types";

type OrganizationFormData = {
  name: string;
  imageUrl: string;
  websiteUrl: string;
  email: string;
  phone: string;
  location: string;
  ico: string;
};

const initialFormData: OrganizationFormData = {
  name: "",
  imageUrl: "",
  websiteUrl: "",
  email: "",
  phone: "",
  location: "",
  ico: "",
};

export function useAdsOrganizationsPage() {
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrganization, setEditingOrganization] =
    useState<AdminOrganization | null>(null);
  const [formData, setFormData] = useState(initialFormData);

  const reload = useCallback(async () => {
    setOrganizations(await listAdminOrganizations(true));
  }, []);

  useEffect(() => {
    async function fetchOrganizations() {
      try {
        setLoading(true);
        setError(null);
        await reload();
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Nastala chyba");
      } finally {
        setLoading(false);
      }
    }

    void fetchOrganizations();
  }, [reload]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingOrganization(null);
    setFormData(initialFormData);
  }, []);

  const openModal = useCallback((organization?: AdminOrganization) => {
    setEditingOrganization(organization ?? null);
    setFormData({
      name: organization?.name ?? "",
      imageUrl: organization?.imageUrl ?? "",
      websiteUrl: organization?.websiteUrl ?? "",
      email: organization?.email ?? "",
      phone: organization?.phone ?? "",
      location: organization?.location ?? "",
      ico: organization?.ico ?? "",
    });
    setIsModalOpen(true);
  }, []);

  const updateFormField = useCallback(
    <TKey extends keyof OrganizationFormData>(
      field: TKey,
      value: OrganizationFormData[TKey],
    ) => {
      setFormData((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    try {
      const payload = {
        name: formData.name,
        imageUrl: formData.imageUrl.trim() || undefined,
        websiteUrl: formData.websiteUrl.trim() || null,
        email: formData.email,
        phone: formData.phone,
        location: formData.location,
        ico: formData.ico.trim() || null,
      };

      await saveAdminOrganization(
        editingOrganization
          ? { id: editingOrganization.id, ...payload }
          : payload,
      );

      await reload();
      closeModal();
    } catch (saveError) {
      alert(saveError instanceof Error ? saveError.message : "Nastala chyba");
    }
  }, [closeModal, editingOrganization, formData, reload]);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Opravdu chcete smazat tuto organizaci?")) {
      return;
    }

    try {
      await deleteAdminOrganization(id);
      setOrganizations((current) =>
        current.filter((organization) => organization.id !== id),
      );
    } catch (deleteError) {
      alert(
        deleteError instanceof Error ? deleteError.message : "Nastala chyba",
      );
    }
  }, []);

  return {
    organizations,
    loading,
    error,
    isModalOpen,
    editingOrganization,
    formData,
    openModal,
    closeModal,
    updateFormField,
    handleSave,
    handleDelete,
  };
}

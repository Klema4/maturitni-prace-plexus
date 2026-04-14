"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteAdminCampaign,
  listAdminCampaigns,
  listAdminOrganizations,
  saveAdminCampaign,
} from "../../api/ads.api";
import type { AdminCampaign, AdminOrganization } from "../../types";

type CampaignFormData = {
  organizationId: string;
  name: string;
  description: string;
  bannerImageUrl: string;
  bannerUrl: string;
  startingAt: string;
  endingAt: string;
};

const initialFormData: CampaignFormData = {
  organizationId: "",
  name: "",
  description: "",
  bannerImageUrl: "",
  bannerUrl: "",
  startingAt: "",
  endingAt: "",
};

export function useAdsCampaignsPage() {
  const [campaigns, setCampaigns] = useState<AdminCampaign[]>([]);
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AdminCampaign | null>(
    null,
  );
  const [formData, setFormData] = useState(initialFormData);

  const reloadCampaigns = useCallback(async () => {
    setCampaigns(await listAdminCampaigns());
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [campaignsData, organizationsData] = await Promise.all([
          listAdminCampaigns(),
          listAdminOrganizations(),
        ]);

        setCampaigns(campaignsData);
        setOrganizations(organizationsData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Nastala chyba");
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCampaign(null);
    setFormData(initialFormData);
  }, []);

  const openModal = useCallback((campaign?: AdminCampaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        organizationId: campaign.organizationId ?? "",
        name: campaign.name,
        description: campaign.description || "",
        bannerImageUrl: campaign.bannerImageUrl || "",
        bannerUrl: campaign.bannerUrl || "",
        startingAt: campaign.startingAt
          ? new Date(campaign.startingAt).toISOString().slice(0, 16)
          : "",
        endingAt: campaign.endingAt
          ? new Date(campaign.endingAt).toISOString().slice(0, 16)
          : "",
      });
    } else {
      setEditingCampaign(null);
      setFormData(initialFormData);
    }

    setIsModalOpen(true);
  }, []);

  const updateFormField = useCallback(
    <TKey extends keyof CampaignFormData>(
      field: TKey,
      value: CampaignFormData[TKey],
    ) => {
      setFormData((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    try {
      const payload = {
        ...formData,
        description: formData.description || null,
        bannerImageUrl: formData.bannerImageUrl || null,
        bannerUrl: formData.bannerUrl || null,
        startingAt: new Date(formData.startingAt).toISOString(),
        endingAt: new Date(formData.endingAt).toISOString(),
      };

      if (editingCampaign) {
        await saveAdminCampaign({
          id: editingCampaign.id,
          ...payload,
        });
      } else {
        await saveAdminCampaign(payload);
      }

      await reloadCampaigns();
      closeModal();
    } catch (saveError) {
      alert(saveError instanceof Error ? saveError.message : "Nastala chyba");
    }
  }, [closeModal, editingCampaign, formData, reloadCampaigns]);

  const handleDelete = useCallback(async (campaignId: string) => {
    if (!confirm("Opravdu chcete smazat tuto kampaň?")) {
      return;
    }

    try {
      await deleteAdminCampaign(campaignId);
      setCampaigns((current) =>
        current.filter((campaign) => campaign.id !== campaignId),
      );
    } catch (deleteError) {
      alert(
        deleteError instanceof Error ? deleteError.message : "Nastala chyba",
      );
    }
  }, []);

  return {
    campaigns,
    organizations,
    loading,
    error,
    isModalOpen,
    editingCampaign,
    formData,
    openModal,
    closeModal,
    updateFormField,
    handleSave,
    handleDelete,
  };
}

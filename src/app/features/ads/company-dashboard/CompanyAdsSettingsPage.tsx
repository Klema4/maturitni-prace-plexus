"use client";

import { useCallback, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/app/components/blog/ui/Button";
import { Input } from "@/app/components/blog/ui/Inputs";
import { useCompanyAdsContext } from "./CompanyAdsProvider";
import {
  getCompanyAdsSettings,
  updateCompanyAdsSettings,
} from "./api/companyAds.api";
import type { CompanyAdsSettingsResponse } from "./types";
import { EmptyState, LoadingState, PageSection, Panel } from "./components";

export default function CompanyAdsSettingsPage() {
  const {
    activeOrganization,
    canManage,
    loading: contextLoading,
    refreshContext,
  } = useCompanyAdsContext();
  const [data, setData] = useState<CompanyAdsSettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    imageUrl: "",
    websiteUrl: "",
    email: "",
    phone: "",
    location: "",
    ico: "",
  });

  const loadData = useCallback(async () => {
    if (!activeOrganization?.id) return;

    try {
      setLoading(true);
      setError(null);
      const json = (await getCompanyAdsSettings(
        activeOrganization.id,
      )) as CompanyAdsSettingsResponse;
      setData(json);
      setFormData({
        name: json.organization.name,
        imageUrl: json.organization.imageUrl,
        websiteUrl: json.organization.websiteUrl ?? "",
        email: json.organization.email,
        phone: json.organization.phone,
        location: json.organization.location,
        ico: json.organization.ico ?? "",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nepodařilo se načíst nastavení firmy.",
      );
    } finally {
      setLoading(false);
    }
  }, [activeOrganization?.id]);

  useEffect(() => {
    if (!activeOrganization?.id || contextLoading) return;
    void loadData();
  }, [activeOrganization?.id, contextLoading, loadData]);

  const handleSave = async () => {
    if (!activeOrganization?.id) return;

    try {
      setSaving(true);
      setError(null);
      await updateCompanyAdsSettings(activeOrganization.id, formData);

      await Promise.all([loadData(), refreshContext()]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Nastavení se nepodařilo uložit.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (contextLoading || loading) {
    return <LoadingState label="Načítám nastavení firmy..." />;
  }

  if (error && !data) {
    return <EmptyState title="Nastavení není dostupné" description={error} />;
  }

  return (
    <div className="space-y-6">
      <PageSection
        title="Nastavení firmy"
        description="Základní údaje firmy, které se propisují do kampaní, týmu i dalších částí workspace."
      />

      {error ? (
        <Panel title="Poslední chyba">
          <p className="text-sm font-medium tracking-tight text-rose-600">
            {error}
          </p>
        </Panel>
      ) : null}

      <Panel
        title="Základní údaje"
        description="Používají se v přehledu firmy, v pozvánkách i v reklamním provozu."
        actions={
          canManage ? (
            <Button
              variant="primary"
              size="sm"
              className="bg-dark text-white"
              onClick={() => {
                void handleSave();
              }}
              disabled={saving}
            >
              <Save size={16} />
              {saving ? "Ukládám..." : "Uložit změny"}
            </Button>
          ) : null
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Název firmy"
            value={formData.name}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            variant="light"
            disabled={!canManage}
          />
          <Input
            label="Logo firmy (URL)"
            value={formData.imageUrl}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                imageUrl: event.target.value,
              }))
            }
            variant="light"
            disabled={!canManage}
          />
          <Input
            label="Web"
            value={formData.websiteUrl}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                websiteUrl: event.target.value,
              }))
            }
            variant="light"
            disabled={!canManage}
          />
          <Input
            label="Kontaktní email"
            value={formData.email}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                email: event.target.value,
              }))
            }
            variant="light"
            disabled={!canManage}
          />
          <Input
            label="Telefon"
            value={formData.phone}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                phone: event.target.value,
              }))
            }
            variant="light"
            disabled={!canManage}
          />
          <Input
            label="Lokace"
            value={formData.location}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                location: event.target.value,
              }))
            }
            variant="light"
            disabled={!canManage}
          />
          <Input
            label="IČO"
            value={formData.ico}
            onChange={(event) =>
              setFormData((current) => ({
                ...current,
                ico: event.target.value,
              }))
            }
            variant="light"
            disabled={!canManage}
          />
        </div>
      </Panel>
    </div>
  );
}

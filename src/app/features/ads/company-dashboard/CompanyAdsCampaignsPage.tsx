"use client";

import { useEffect, useCallback, useRef, useMemo, useState } from "react";
import {
  Edit3,
  ExternalLink,
  Megaphone,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/app/components/blog/ui/Button";
import { Input } from "@/app/components/blog/ui/Inputs";
import { CampaignBannerField } from "@/app/features/ads/company-dashboard/components/CampaignBannerField";
import { useCompanyAdsContext } from "./CompanyAdsProvider";
import {
  deleteCompanyAdsCampaign,
  listCompanyAdsCampaigns,
  saveCompanyAdsCampaign,
} from "./api/companyAds.api";
import type { CompanyAdsCampaign } from "./types";
import {
  EmptyState,
  LoadingState,
  PageSection,
  Panel,
  formatDate,
  formatNumber,
} from "./components";

type CampaignsResponse = {
  role: "owner" | "manager" | "viewer";
  canManage: boolean;
  campaigns: CompanyAdsCampaign[];
};

const initialForm = {
  name: "",
  description: "",
  bannerImageUrl: "",
  bannerUrl: "",
  startingAt: "",
  endingAt: "",
};

export default function CompanyAdsCampaignsPage() {
  const {
    activeOrganization,
    canManage,
    loading: contextLoading,
  } = useCompanyAdsContext();
  const [data, setData] = useState<CampaignsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingCampaign, setEditingCampaign] =
    useState<CompanyAdsCampaign | null>(null);
  const [formData, setFormData] = useState(initialForm);

  const lastFetchedOrgRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  const loadData = useCallback(async () => {
    if (!activeOrganization?.id) return;
    const orgId = activeOrganization.id;

    // Nespouštěj nový požadavek, pokud už jeden běží nebo jsme tuto organizaci už načetli
    if (inFlightRef.current || lastFetchedOrgRef.current === orgId) return;

    try {
      inFlightRef.current = true;
      setLoading(true);
      setError(null);
      const json = (await listCompanyAdsCampaigns(orgId)) as CampaignsResponse;
      setData(json);
      lastFetchedOrgRef.current = orgId;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Nepodařilo se načíst kampaně firmy.",
      );
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [activeOrganization?.id]);

  useEffect(() => {
    if (!activeOrganization?.id || contextLoading) return;

    // `loadData` už hlídá duplicitní a souběžné požadavky
    void loadData();
  }, [activeOrganization?.id, contextLoading]);

  const filteredCampaigns = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return data?.campaigns ?? [];

    return (data?.campaigns ?? []).filter((campaign) => {
      return (
        campaign.name.toLowerCase().includes(term) ||
        campaign.description?.toLowerCase().includes(term)
      );
    });
  }, [data?.campaigns, search]);

  const resetForm = () => {
    setEditingCampaign(null);
    setFormData(initialForm);
    setFormOpen(false);
  };

  const startCreate = () => {
    setEditingCampaign(null);
    setFormData(initialForm);
    setFormOpen(true);
  };

  const startEdit = (campaign: CompanyAdsCampaign) => {
    setEditingCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description ?? "",
      bannerImageUrl: campaign.bannerImageUrl ?? "",
      bannerUrl: campaign.bannerUrl ?? "",
      startingAt: new Date(campaign.startingAt).toISOString().slice(0, 16),
      endingAt: new Date(campaign.endingAt).toISOString().slice(0, 16),
    });
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!activeOrganization?.id) return;

    try {
      setSaving(true);
      await saveCompanyAdsCampaign(
        activeOrganization.id,
        editingCampaign ? "PATCH" : "POST",
        {
          ...(editingCampaign ? { id: editingCampaign.id } : null),
          ...formData,
        },
      );

      resetForm();
      lastFetchedOrgRef.current = null;
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Kampaň se nepodařilo uložit.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (campaignId: string) => {
    if (!activeOrganization?.id) return;
    if (!confirm("Opravdu chcete tuto kampaň odstranit?")) return;

    try {
      await deleteCompanyAdsCampaign(activeOrganization.id, campaignId);
      lastFetchedOrgRef.current = null;
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Kampaň se nepodařilo odstranit.",
      );
    }
  };

  if (contextLoading || loading) {
    return <LoadingState label="Načítám kampaně firmy..." />;
  }

  if (error && !data) {
    return <EmptyState title="Kampaně nejsou dostupné" description={error} />;
  }

  return (
    <div className="space-y-6">
      <PageSection
        title="Kampaně a reklamy firmy"
        description="Tady spravujete všechny reklamní kampaně vybrané firmy na jednom místě."
        actions={
          canManage ? (
            <Button
              variant="primary"
              size="sm"
              className="bg-dark text-white"
              onClick={startCreate}
            >
              <Plus size={16} />
              Nová kampaň
            </Button>
          ) : null
        }
      />

      <Panel
        title="Filtrovat kampaně"
        description="Rychlé hledání podle názvu nebo krátkého popisu kampaně."
      >
        <Input
          label="Hledání"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Např. jarní launch, brand awareness..."
          variant="light"
        />
      </Panel>

      {error ? (
        <Panel title="Poslední chyba">
          <p className="text-sm font-medium tracking-tight text-rose-600">
            {error}
          </p>
        </Panel>
      ) : null}

      {formOpen ? (
        <Panel
          title={editingCampaign ? "Upravit kampaň" : "Nová kampaň"}
          description="Kampaň se ukládá rovnou do právě vybrané firmy."
          actions={
            <Button variant="ghost" size="sm" onClick={resetForm}>
              <X size={16} />
              Zavřít
            </Button>
          }
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input
              label="Název kampaně"
              value={formData.name}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              variant="light"
            />
            <Input
              label="Cílová URL"
              value={formData.bannerUrl}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  bannerUrl: event.target.value,
                }))
              }
              variant="light"
            />
            <CampaignBannerField
              value={formData.bannerImageUrl}
              onChange={(value) =>
                setFormData((current) => ({
                  ...current,
                  bannerImageUrl: value,
                }))
              }
            />
            <Input
              label="Začátek kampaně"
              type="datetime-local"
              value={formData.startingAt}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  startingAt: event.target.value,
                }))
              }
              variant="light"
            />
            <Input
              label="Konec kampaně"
              type="datetime-local"
              value={formData.endingAt}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  endingAt: event.target.value,
                }))
              }
              variant="light"
            />
          </div>
          <div className="mt-4 space-y-2">
            <label
              htmlFor="company-ads-campaign-description"
              className="text-sm font-medium tracking-tight text-dark"
            >
              Popis kampaně
            </label>
            <textarea
              id="company-ads-campaign-description"
              value={formData.description}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              className="min-h-[120px] w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium tracking-tight text-dark outline-none transition focus:ring-2 focus:ring-primary"
              placeholder="Jaký je cíl, claim nebo nabídka této kampaně?"
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
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
              {saving
                ? "Ukládám..."
                : editingCampaign
                  ? "Uložit změny"
                  : "Vytvořit kampaň"}
            </Button>
            <Button variant="outline" size="sm" onClick={resetForm}>
              Zrušit
            </Button>
          </div>
        </Panel>
      ) : null}

      <Panel
        title="Seznam kampaní"
        description="Přehled všech reklamních aktivit právě vybrané firmy."
      >
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredCampaigns.length === 0 ? (
            <div className="xl:col-span-2">
              <EmptyState
                title="Žádná kampaň neodpovídá filtru"
                description="Zkuste jiný výraz nebo založte první kampaň firmy."
              />
            </div>
          ) : (
            filteredCampaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="overflow-hidden rounded-[28px] border border-black/6 bg-white shadow-[0_24px_60px_-42px_rgba(15,23,42,0.28)]"
              >
                {campaign.bannerImageUrl ? (
                  <img
                    src={campaign.bannerImageUrl}
                    alt={campaign.name}
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-[linear-gradient(135deg,_rgba(244,244,245,1),rgba(238,242,255,1))] text-zinc-400">
                    <Megaphone size={28} />
                  </div>
                )}
                <div className="space-y-4 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xl font-semibold tracking-tight text-dark">
                        {campaign.name}
                      </p>
                      <p className="mt-1 text-sm font-medium tracking-tight text-zinc-500">
                        {formatDate(campaign.startingAt)} až{" "}
                        {formatDate(campaign.endingAt)}
                      </p>
                    </div>
                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-semibold tracking-tight text-zinc-600">
                      {formatNumber(campaign.viewCount)} zobrazení
                    </span>
                  </div>
                  {campaign.description ? (
                    <p className="text-sm font-medium leading-relaxed tracking-tight text-zinc-600">
                      {campaign.description}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {campaign.bannerUrl ? (
                      <a
                        href={campaign.bannerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-medium tracking-tight text-zinc-600 hover:text-dark"
                      >
                        <ExternalLink size={15} />
                        Otevřít cíl
                      </a>
                    ) : null}
                    {canManage ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(campaign)}
                        >
                          <Edit3 size={15} />
                          Upravit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            void handleDelete(campaign.id);
                          }}
                          className="text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 size={15} />
                          Smazat
                        </Button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}

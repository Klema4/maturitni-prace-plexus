"use client";

import Image from "next/image";
import { Card } from "@/components/ui/dashboard/Card";
import QuickOptions from "@/components/ui/dashboard/QuickOptions";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@/components/ui/dashboard/Modal";
import Button from "@/components/ui/dashboard/Button";
import { Input, Textarea } from "@/components/ui/dashboard/Inputs";
import {
  List,
  Plus,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Building2,
  Save,
  User,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import NoData from "@/components/ui/dashboard/NoData";
import type { AdminCampaign as Campaign } from "../types";
import { useAdsCampaignsPage } from "./hooks/useAdsCampaignsPage";
import { CampaignBannerField } from "./components/CampaignBannerField";

export default function AdCampaigns() {
  const {
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
  } = useAdsCampaignsPage();

  /**
   * Určí stav kampaně podle `startingAt`/`endingAt`.
   * @param {string|Date} startingAt - Začátek kampaně.
   * @param {string|Date} endingAt - Konec kampaně.
   * @return {{label: string, color: string}} Stav kampaně a tailwind třídy.
   */
  const getCampaignStatus = (
    startingAt: string | Date,
    endingAt: string | Date,
  ) => {
    const now = new Date();
    const start = new Date(startingAt);
    const end = new Date(endingAt);

    if (now < start) {
      return {
        label: "Plánováno",
        color: "border border-amber-500/30 bg-amber-500/15 text-amber-300",
      };
    } else if (now >= start && now <= end) {
      return {
        label: "Aktivní",
        color:
          "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
      };
    } else {
      return {
        label: "Ukončeno",
        color: "border border-red-500/30 bg-red-500/15 text-red-300",
      };
    }
  };

  /**
   * Vrátí bucket pro třídění do sekcí: probíhá → bude probíhat → ukončeno.
   * @param {string|Date} startingAt - Začátek kampaně.
   * @param {string|Date} endingAt - Konec kampaně.
   * @return {"running"|"upcoming"|"ended"} Kategorie kampaně.
   */
  const getCampaignBucket = (
    startingAt: string | Date,
    endingAt: string | Date,
  ): "running" | "upcoming" | "ended" => {
    const now = new Date();
    const start = new Date(startingAt);
    const end = new Date(endingAt);

    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "running";
    return "ended";
  };

  /**
   * Formátuje datum/čas pro zobrazení v UI.
   * @param {string|Date} value - Datum jako ISO string nebo Date.
   * @return {string} Naformátované datum.
   */
  const formatDateTime = (value: string | Date) =>
    format(new Date(value), "d.M.yyyy HH:mm");

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("cs-CZ").format(num);
  };

  const now = new Date();
  const runningCampaigns = campaigns
    .filter((c) => getCampaignBucket(c.startingAt, c.endingAt) === "running")
    .sort((a, b) => +new Date(a.endingAt) - +new Date(b.endingAt));
  const upcomingCampaigns = campaigns
    .filter((c) => getCampaignBucket(c.startingAt, c.endingAt) === "upcoming")
    .sort((a, b) => +new Date(a.startingAt) - +new Date(b.startingAt));
  const endedCampaigns = campaigns
    .filter((c) => getCampaignBucket(c.startingAt, c.endingAt) === "ended")
    .sort((a, b) => +new Date(b.endingAt) - +new Date(a.endingAt));

  if (loading) {
    return (
      <>
        <header>
          <Heading variant="h1">Kampaně a reklamy</Heading>
          <Paragraph>Spravuj kampaně a jednotlivé reklamy v systému.</Paragraph>
        </header>
        <div className="mt-4 flex items-center justify-center">
          <Paragraph color="muted">Načítám kampaně...</Paragraph>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header>
          <Heading variant="h1">Kampaně a reklamy</Heading>
          <Paragraph>Spravuj kampaně a jednotlivé reklamy v systému.</Paragraph>
        </header>
        <div className="mt-4">
          <Paragraph color="muted" className="text-red-400">
            {error}
          </Paragraph>
        </div>
      </>
    );
  }

  return (
    <>
      <header>
        <Heading variant="h1">Kampaně a reklamy</Heading>
        <Paragraph>Spravuj kampaně a jednotlivé reklamy v systému.</Paragraph>
      </header>
      <QuickOptions
        options={[
          {
            label: "Nová kampaň",
            variant: "primary",
            icon: Plus,
            onClick: () => openModal(),
          },
        ]}
      />
      <section className="mt-4 space-y-6">
        {campaigns.length === 0 && (
          <div>
            <NoData />
          </div>
        )}

        {campaigns.length > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800/70 bg-zinc-900/40 px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white">
                <Clock size={16} className="text-zinc-400" />
                <span>Aktuální čas</span>
              </div>
              <div className="text-sm font-medium tracking-tight text-zinc-300">
                {format(now, "d.M.yyyy HH:mm")}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <Heading variant="h3">Probíhá</Heading>
                  <Paragraph size="small" color="muted">
                    Kampaně, které jsou právě aktivní.
                  </Paragraph>
                </div>
                <div className="text-sm font-semibold tracking-tight text-zinc-300">
                  {runningCampaigns.length} ks
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {runningCampaigns.map((campaign) => {
                  const status = getCampaignStatus(
                    campaign.startingAt,
                    campaign.endingAt,
                  );
                  const organizationName =
                    campaign.organization?.name ?? "Neznámá organizace";
                  return (
                    <Card key={campaign.id} className="p-4!">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <Building2 size={16} className="text-zinc-500" />
                            <p className="truncate text-xs font-semibold uppercase tracking-wide text-zinc-400">
                              {organizationName}
                            </p>
                          </div>
                          <Heading variant="h4" className="truncate">
                            {campaign.name}
                          </Heading>
                          {campaign.description && (
                            <Paragraph size="small" className="max-w-full">
                              {campaign.description}
                            </Paragraph>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                            onClick={() => openModal(campaign)}
                            title="Upravit kampaň"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-400"
                            onClick={() => handleDelete(campaign.id)}
                            title="Smazat kampaň"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {campaign.bannerImageUrl ? (
                        <Image
                          src={campaign.bannerImageUrl}
                          alt={campaign.name}
                          width={400}
                          height={160}
                          className="mb-3 h-40 w-full rounded-lg object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="mb-3 h-40 w-full rounded-lg border border-zinc-800/70 bg-zinc-800/50" />
                      )}

                      <div className="grid grid-cols-1 gap-2 text-xs font-medium tracking-tight text-zinc-400">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <User size={14} className="text-zinc-500" />
                            <span>Autor: {organizationName}</span>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-zinc-500" />
                            <span>
                              Od {formatDateTime(campaign.startingAt)} do{" "}
                              {formatDateTime(campaign.endingAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Eye size={14} className="text-zinc-500" />
                            <span>
                              {formatNumber(campaign.viewCount ?? 0)} zobrazení
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <Heading variant="h3">Bude probíhat</Heading>
                  <Paragraph size="small" color="muted">
                    Kampaně naplánované do budoucna.
                  </Paragraph>
                </div>
                <div className="text-sm font-semibold tracking-tight text-zinc-300">
                  {upcomingCampaigns.length} ks
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {upcomingCampaigns.map((campaign) => {
                  const status = getCampaignStatus(
                    campaign.startingAt,
                    campaign.endingAt,
                  );
                  const organizationName =
                    campaign.organization?.name ?? "Neznámá organizace";
                  return (
                    <Card key={campaign.id} className="p-4!">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <Building2 size={16} className="text-zinc-500" />
                            <p className="truncate text-xs font-semibold uppercase tracking-wide text-zinc-400">
                              {organizationName}
                            </p>
                          </div>
                          <Heading variant="h4" className="truncate">
                            {campaign.name}
                          </Heading>
                          {campaign.description && (
                            <Paragraph size="small" className="max-w-full">
                              {campaign.description}
                            </Paragraph>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                            onClick={() => openModal(campaign)}
                            title="Upravit kampaň"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-400"
                            onClick={() => handleDelete(campaign.id)}
                            title="Smazat kampaň"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {campaign.bannerImageUrl ? (
                        <Image
                          src={campaign.bannerImageUrl}
                          alt={campaign.name}
                          width={400}
                          height={160}
                          className="mb-3 h-40 w-full rounded-lg object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="mb-3 h-40 w-full rounded-lg border border-zinc-800/70 bg-zinc-800/50" />
                      )}

                      <div className="grid grid-cols-1 gap-2 text-xs font-medium tracking-tight text-zinc-400">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <User size={14} className="text-zinc-500" />
                            <span>Autor: {organizationName}</span>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-zinc-500" />
                            <span>
                              Od {formatDateTime(campaign.startingAt)} do{" "}
                              {formatDateTime(campaign.endingAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Eye size={14} className="text-zinc-500" />
                            <span>
                              {formatNumber(campaign.viewCount ?? 0)} zobrazení
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <Heading variant="h3">Ukončeno</Heading>
                  <Paragraph size="small" color="muted">
                    Historické kampaně, které už doběhly.
                  </Paragraph>
                </div>
                <div className="text-sm font-semibold tracking-tight text-zinc-300">
                  {endedCampaigns.length} ks
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {endedCampaigns.map((campaign) => {
                  const status = getCampaignStatus(
                    campaign.startingAt,
                    campaign.endingAt,
                  );
                  const organizationName =
                    campaign.organization?.name ?? "Neznámá organizace";
                  return (
                    <Card key={campaign.id} className="p-4!">
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <Building2 size={16} className="text-zinc-500" />
                            <p className="truncate text-xs font-semibold uppercase tracking-wide text-zinc-400">
                              {organizationName}
                            </p>
                          </div>
                          <Heading variant="h4" className="truncate">
                            {campaign.name}
                          </Heading>
                          {campaign.description && (
                            <Paragraph size="small" className="max-w-full">
                              {campaign.description}
                            </Paragraph>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                            onClick={() => openModal(campaign)}
                            title="Upravit kampaň"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-400"
                            onClick={() => handleDelete(campaign.id)}
                            title="Smazat kampaň"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {campaign.bannerImageUrl ? (
                        <Image
                          src={campaign.bannerImageUrl}
                          alt={campaign.name}
                          width={400}
                          height={160}
                          className="mb-3 h-40 w-full rounded-lg object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="mb-3 h-40 w-full rounded-lg border border-zinc-800/70 bg-zinc-800/50" />
                      )}

                      <div className="grid grid-cols-1 gap-2 text-xs font-medium tracking-tight text-zinc-400">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <User size={14} className="text-zinc-500" />
                            <span>Autor: {organizationName}</span>
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold tracking-tight ${status.color}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-zinc-500" />
                            <span>
                              Od {formatDateTime(campaign.startingAt)} do{" "}
                              {formatDateTime(campaign.endingAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <Eye size={14} className="text-zinc-500" />
                            <span>
                              {formatNumber(campaign.viewCount ?? 0)} zobrazení
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        size="lg"
      >
        <ModalHeader onClose={closeModal}>
          <div className="flex items-center gap-2">
            <List className="w-5 h-5 text-blue-400" />
            <span>{editingCampaign ? "Upravit kampaň" : "Nová kampaň"}</span>
          </div>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div>
            <label className="block text-sm font-medium tracking-tight text-white mb-1.5">
              Organizace
            </label>
            <select
              value={formData.organizationId}
              onChange={(e) => updateFormField("organizationId", e.target.value)}
              className="w-full bg-zinc-800/75 border border-zinc-700/50 rounded-md text-white text-sm tracking-tight font-medium focus:outline-none focus:ring-2 focus:ring-white/75 transition-all px-3 py-2.5"
              required
            >
              <option value="">Vyber organizaci...</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Název kampaně"
            value={formData.name}
            onChange={(e) => updateFormField("name", e.target.value)}
            placeholder="Zadej název..."
            maxLength={256}
            required
          />
          <Textarea
            label="Popis"
            value={formData.description}
            onChange={(e) => updateFormField("description", e.target.value)}
            placeholder="Zadej popis kampaně..."
            maxLength={1024}
          />
          <CampaignBannerField
            value={formData.bannerImageUrl}
            onChange={(value) => updateFormField("bannerImageUrl", value)}
          />
          <Input
            label="URL kampaně"
            type="url"
            value={formData.bannerUrl}
            onChange={(e) => updateFormField("bannerUrl", e.target.value)}
            placeholder="https://..."
            maxLength={4096}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Začátek kampaně"
              type="datetime-local"
              value={formData.startingAt}
              onChange={(e) => updateFormField("startingAt", e.target.value)}
              required
            />
            <Input
              label="Konec kampaně"
              type="datetime-local"
              value={formData.endingAt}
              onChange={(e) => updateFormField("endingAt", e.target.value)}
              required
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex justify-end gap-2">
            <Button
              href="#"
              variant="outline"
              onClick={closeModal}
            >
              Zrušit
            </Button>
            <Button
              href="#"
              variant="primary"
              onClick={handleSave}
              UseIcon={Save}
            >
              Uložit
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
}

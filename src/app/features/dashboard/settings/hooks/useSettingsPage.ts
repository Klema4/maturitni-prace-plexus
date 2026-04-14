"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getDashboardSettings,
  updateDashboardSettings,
} from "../api/settings.api";
import type {
  DashboardSettings,
  DashboardSettingsFormData,
  DashboardSettingsPatch,
} from "../types";

type SaveFeedback =
  | { type: "success"; message: string }
  | { type: "error"; message: string };

/**
 * Vytvoří PATCH payload pro nastavení (umožní ukládat postupně).
 * Posílají se jen změněná pole. Prázdná textová pole se neposílají, aby se
 * nepřepisovala uložená data.
 *
 * @param {DashboardSettingsFormData} formData - Aktuální data z formuláře.
 * @param {DashboardSettings | null} settings - Aktuálně uložená nastavení (pro detekci změn).
 * @returns {DashboardSettingsPatch} Patch payload s vyplněnými poli.
 */
function buildSettingsPatch(
  formData: DashboardSettingsFormData,
  settings: DashboardSettings | null,
): DashboardSettingsPatch {
  const patch: DashboardSettingsPatch = {};

  const setIfFilledAndChanged = (
    key: keyof Omit<DashboardSettingsFormData, "registrationEnabled">,
    currentValue: string | null,
  ) => {
    const value = formData[key];
    if (typeof value === "string" && value.trim() !== "") {
      const next = value.trim();
      if ((currentValue ?? "") !== next) {
        patch[key] = next;
      }
    }
  };

  if (!settings || settings.registrationEnabled !== formData.registrationEnabled) {
    patch.registrationEnabled = formData.registrationEnabled;
  }

  setIfFilledAndChanged("name", settings?.name ?? null);
  setIfFilledAndChanged("seoName", settings?.seoName ?? null);
  setIfFilledAndChanged("seoAuthor", settings?.seoAuthor ?? null);
  setIfFilledAndChanged("seoUrl", settings?.seoUrl ?? null);
  setIfFilledAndChanged("seoDescription", settings?.seoDescription ?? null);
  setIfFilledAndChanged("seoImageUrl", settings?.seoImageUrl ?? null);
  setIfFilledAndChanged("seoHex", settings?.seoHex ?? null);
  setIfFilledAndChanged("plunkFromEmail", settings?.plunkFromEmail ?? null);

  if (formData.plunkApiKey.trim() !== "") {
    patch.plunkApiKey = formData.plunkApiKey.trim();
  }

  return patch;
}

const initialFormData: DashboardSettingsFormData = {
  name: "",
  seoName: "",
  seoAuthor: "",
  seoUrl: "",
  seoDescription: "",
  seoImageUrl: "",
  seoHex: "",
  registrationEnabled: true,
  plunkFromEmail: "",
  plunkApiKey: "",
};

export function useSettingsPage() {
  const [settings, setSettings] = useState<DashboardSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<SaveFeedback | null>(null);
  const [formData, setFormData] = useState<DashboardSettingsFormData>(
    initialFormData,
  );

  /**
   * Zavře modal se stavem uložení (success/error).
   *
   * @returns {void} Bez návratové hodnoty.
   */
  const closeSaveFeedback = useCallback(() => {
    setSaveFeedback(null);
  }, []);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        setError(null);

        const nextSettings = await getDashboardSettings();
        setSettings(nextSettings);

        if (nextSettings) {
          setFormData({
            name: nextSettings.name || "",
            seoName: nextSettings.seoName || "",
            seoAuthor: nextSettings.seoAuthor || "",
            seoUrl: nextSettings.seoUrl || "",
            seoDescription: nextSettings.seoDescription || "",
            seoImageUrl: nextSettings.seoImageUrl || "",
            seoHex: nextSettings.seoHex || "",
            registrationEnabled: nextSettings.registrationEnabled,
            plunkFromEmail: nextSettings.plunkFromEmail || "",
            plunkApiKey: "",
          });
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Nastala chyba");
      } finally {
        setLoading(false);
      }
    }

    void fetchSettings();
  }, []);

  const updateFormField = useCallback(
    <TKey extends keyof DashboardSettingsFormData>(
      field: TKey,
      value: DashboardSettingsFormData[TKey],
    ) => {
      setFormData((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const handleSave = useCallback(async () => {
    setSaving(true);

    try {
      const patch = buildSettingsPatch(formData, settings);
      if (Object.keys(patch).length === 0) {
        setSaveFeedback({
          type: "success",
          message:
            "Nic nebylo změněno. Uprav některé nastavení pro uložení nových změn",
        });
        return;
      }

      const nextSettings = await updateDashboardSettings(patch);
      setSettings(nextSettings);
      setFormData({
        name: nextSettings?.name || "",
        seoName: nextSettings?.seoName || "",
        seoAuthor: nextSettings?.seoAuthor || "",
        seoUrl: nextSettings?.seoUrl || "",
        seoDescription: nextSettings?.seoDescription || "",
        seoImageUrl: nextSettings?.seoImageUrl || "",
        seoHex: nextSettings?.seoHex || "",
        registrationEnabled: nextSettings?.registrationEnabled ?? true,
        plunkFromEmail: nextSettings?.plunkFromEmail || "",
        plunkApiKey: "",
      });
      setSaveFeedback({ type: "success", message: "Nastavení bylo úspěšně uloženo" });
    } catch (saveError) {
      setSaveFeedback({
        type: "error",
        message: saveError instanceof Error ? saveError.message : "Nastala chyba",
      });
    } finally {
      setSaving(false);
    }
  }, [formData, settings]);

  return {
    settings,
    loading,
    error,
    saving,
    saveFeedback,
    closeSaveFeedback,
    formData,
    updateFormField,
    handleSave,
  };
}

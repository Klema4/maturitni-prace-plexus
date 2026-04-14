'use client'

import Button from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { Input, Textarea, Toggle } from "@/components/ui/dashboard/Inputs";
import { Modal, ModalBody, ModalFooter, ModalHeader } from "@/components/ui/dashboard/Modal";
import QuickOptions from "@/components/ui/dashboard/QuickOptions";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import type { LucideIcon } from "lucide-react";
import {
  Save,
  Settings as SettingsIcon,
  Globe,
  Mail,
  Shield,
  KeyRound,
  AlertTriangle,
} from "lucide-react";
import { useSettingsPage } from "./hooks/useSettingsPage";

/**
 * Normalizuje HEX barvu pro uložení do DB.
 * Ukládáme bez `#` ve formátu `RRGGBB`.
 *
 * @param {string} value - Hodnota z inputu (může obsahovat `#`).
 * @returns {string} Normalizovaná hodnota bez `#`.
 */
function normalizeHexForStorage(value: string): string {
  return value.replace("#", "").trim().toUpperCase();
}

/**
 * Hlavička sekce pro nastavení.
 * Sjednocuje vzhled ikonky, titulku a případného popisu napříč kartami.
 *
 * @param {Object} props - Props komponenty.
 * @param {LucideIcon} props.icon - Ikona sekce.
 * @param {string} props.title - Název sekce.
 * @param {string} [props.description] - Volitelný popis.
 * @param {string} props.accentClassName - Třídy pro akcent (barvy) ikonky.
 * @returns {JSX.Element} Hlavička sekce.
 */
function SettingsSectionHeader({
  icon: Icon,
  title,
  description,
  accentClassName,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  accentClassName: string;
}) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <div
        className={`mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800/60 bg-zinc-950/40 ${accentClassName}`}
      >
        <Icon size={18} className="text-current" />
      </div>
      <div className="min-w-0 flex-1">
        <Heading variant="h4" className="leading-6!">
          {title}
        </Heading>
        {description ? (
          <Paragraph size="small" color="muted" className="mt-1">
            {description}
          </Paragraph>
        ) : null}
      </div>
    </div>
  );
}

export default function Settings() {
  const { loading, error, saving, settings, saveFeedback, closeSaveFeedback, formData, updateFormField, handleSave } =
    useSettingsPage();

  const hasIncompleteSettings =
    !formData.name?.trim() ||
    !formData.seoName?.trim() ||
    !formData.seoAuthor?.trim() ||
    !formData.seoDescription?.trim() ||
    !formData.seoUrl?.trim() ||
    !formData.seoImageUrl?.trim() ||
    !formData.seoHex?.trim() ||
    !formData.plunkFromEmail?.trim();

  if (loading) {
    return (
      <>
        <header>
          <Heading variant="h1">Nastavení magazínu</Heading>
          <Paragraph>Konfiguruj obecné nastavení magazínu.</Paragraph>
        </header>
        <div className="mt-4 flex items-center justify-center">
          <Paragraph color="muted">Načítám nastavení...</Paragraph>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header>
          <Heading variant="h1">Nastavení magazínu</Heading>
          <Paragraph>Konfiguruj obecné nastavení magazínu.</Paragraph>
        </header>
        <div className="mt-4">
          <Paragraph color="muted" className="text-red-400">{error}</Paragraph>
        </div>
      </>
    );
  }

  return (
    <>
      <header>
        <Heading variant="h1">Nastavení magazínu</Heading>
        <Paragraph>Konfiguruj obecné nastavení magazínu.</Paragraph>
      </header>
      <QuickOptions options={[
        { label: "Uložit změny", variant: "primary", icon: Save, onClick: handleSave, disabled: saving },
      ]} />
      <Modal isOpen={Boolean(saveFeedback)} onClose={closeSaveFeedback} size="sm">
        <ModalHeader onClose={closeSaveFeedback}>
          {saveFeedback?.type === "success" ? "Uloženo" : "Chyba"}
        </ModalHeader>
        <ModalBody className="text-zinc-300">
          {saveFeedback?.message ?? ""}
        </ModalBody>
        <ModalFooter>
          <Button
            href="#"
            variant={saveFeedback?.type === "success" ? "primary" : "outline"}
            onClick={closeSaveFeedback}
            className="cursor-pointer tracking-tight"
          >
            OK
          </Button>
        </ModalFooter>
      </Modal>
      {hasIncompleteSettings && (
        <div className="mt-4 w-full rounded-xl border border-red-500/30 bg-red-500/10 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-400" />
            <div className="flex-1">
              <Paragraph className="text-sm font-semibold text-red-300">
                Pozor: nejsou vyplněna všechna nastavení.
              </Paragraph>
              <Paragraph size="small" className="mt-1 text-red-200/90">
                Můžeš ukládat postupně. Prázdná pole se neuloží a nebudou přepisovat už uložená data; v aplikaci se pak zobrazí výchozí hodnoty tam, kde nic nastavené není.
              </Paragraph>
              {settings?.hasPlunkApiKey && !formData.plunkApiKey?.trim() && (
                <Paragraph size="small" className="mt-2 text-red-200/90">
                  Plunk API key se z bezpečnostních důvodů nezobrazuje; když ho necháš prázdný, zůstane uložený beze změny.
                </Paragraph>
              )}
            </div>
          </div>
        </div>
      )}
      <section className="mt-4">
        <div className="grid grid-cols-1 gap-4">
          <Card>
            <SettingsSectionHeader
              icon={SettingsIcon}
              title="Obecné"
              description="Základní údaje o magazínu."
              accentClassName="text-blue-300"
            />
            <div className="space-y-4">
              <Input
                label="Název magazínu"
                value={formData.name}
                onChange={(e) => updateFormField("name", e.target.value)}
                placeholder="Např. Plexus magazín"
                maxLength={128}
              />
            </div>
          </Card>
          <Card>
            <SettingsSectionHeader
              icon={Globe}
              title="SEO"
              description="Jak se magazín zobrazuje ve vyhledávačích a embedech."
              accentClassName="text-violet-300"
            />
            <div className="space-y-4">
              <Input
                label="SEO název"
                value={formData.seoName}
                onChange={(e) => updateFormField("seoName", e.target.value)}
                placeholder="Např. Plexus – magazín o..."
                maxLength={256}
              />
              <Input
                label="SEO autor"
                value={formData.seoAuthor}
                onChange={(e) => updateFormField("seoAuthor", e.target.value)}
                placeholder="Např. Redakce Plexus"
                maxLength={128}
              />
              <Input
                label="URL magazínu"
                value={formData.seoUrl || ""}
                onChange={(e) => updateFormField("seoUrl", e.target.value)}
                placeholder="https://tvoje-domena.cz"
                maxLength={1024}
              />
              <Textarea
                label="SEO popis"
                value={formData.seoDescription}
                onChange={(e) => updateFormField("seoDescription", e.target.value)}
                rows={3}
                placeholder="Krátký popis pro vyhledávače/preview..."
                maxLength={512}
              />
              <Input
                label="SEO obrázek URL"
                type="url"
                value={formData.seoImageUrl}
                onChange={(e) => updateFormField("seoImageUrl", e.target.value)}
                placeholder="https://…/og-image.png"
                maxLength={1024}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium tracking-tight text-white">
                  Barva embedu (HEX)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={`#${(formData.seoHex || "000000").padStart(6, "0").slice(0, 6)}`}
                    onChange={(e) =>
                      updateFormField("seoHex", normalizeHexForStorage(e.target.value))
                    }
                    className="h-9 w-12 cursor-pointer rounded border border-zinc-700 bg-zinc-900 p-1"
                    aria-label="Vybrat barvu"
                  />
                  <Input
                    value={formData.seoHex}
                    onChange={(e) =>
                      updateFormField("seoHex", normalizeHexForStorage(e.target.value))
                    }
                    placeholder="RRGGBB (např. FF8800)"
                    maxLength={6}
                    className="flex-1"
                    description="Ukládá se bez # jako 6 znaků (RRGGBB)."
                  />
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <SettingsSectionHeader
              icon={Shield}
              title="Zabezpečení"
              description="Bezpečnostní volby aplikace."
              accentClassName="text-red-300"
            />
            <Toggle
              label="Povolit registraci nových uživatelů"
              description="Když je vypnuté, nové účty nepůjdou vytvořit přes registraci."
              checked={formData.registrationEnabled}
              onChange={(e) => updateFormField("registrationEnabled", e.target.checked)}
            />
          </Card>
          <Card>
            <SettingsSectionHeader
              icon={Mail}
              title="Email integrace (Plunk)"
              description="Klíč se ukládá šifrovaně do DB. Odesílací email musí být ověřený v Plunku."
              accentClassName="text-emerald-300"
            />
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Odesílací email (From)"
                  type="email"
                  value={formData.plunkFromEmail}
                  onChange={(e) => updateFormField("plunkFromEmail", e.target.value)}
                  placeholder="noreply@tvoje-domena.cz"
                  maxLength={256}
                />
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-3">
                    <label className="block text-sm font-medium tracking-tight text-white">
                      Plunk API key
                    </label>
                    {settings?.hasPlunkApiKey ? (
                      <span className="text-xs font-medium tracking-tight text-emerald-300">
                        Klíč je uložen
                      </span>
                    ) : (
                      <span className="text-xs font-medium tracking-tight text-zinc-500">
                        Klíč není nastaven
                      </span>
                    )}
                  </div>
                  <Input
                    type="password"
                    value={formData.plunkApiKey}
                    onChange={(e) => updateFormField("plunkApiKey", e.target.value)}
                    placeholder="Zadej nový klíč (nebo nech prázdné pro zachování)"
                    maxLength={512}
                    description="Pokud pole necháš prázdné, klíč se nezmění."
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </>
  );
}

'use client'

import React, { useMemo } from 'react';
import { Toggle } from '@/components/ui/dashboard/Inputs';
import { Paragraph } from '@/components/ui/dashboard/TextUtils';
import { Search, X } from 'lucide-react';
import { PERMISSIONS } from '@/lib/permissions';

type PermissionKey = keyof typeof PERMISSIONS;

/**
 * Popisy oprávnění pro lepší UX
 */
const PERMISSION_DESCRIPTIONS: Record<PermissionKey, string> = {
  ANALYTICS_VIEW: 'Umožní členům zobrazovat analytické přehledy a statistiky.',
  ANALYTICS_EXPORT: 'Umožní členům exportovat analytická data do souborů.',
  OVERVIEW_VIEW: 'Umožní členům zobrazovat přehled dashboardu.',
  SECTIONS_MANAGE: 'Umožní členům vytvářet, upravovat nebo odstraňovat sekce.',
  TAGS_MANAGE: 'Umožní členům vytvářet, upravovat nebo odstraňovat štítky.',
  ARTICLES_VIEW: 'Umožní členům zobrazovat články.',
  ARTICLES_CREATE: 'Umožní členům vytvářet nové články.',
  ARTICLES_EDIT_OWN: 'Umožní členům upravovat vlastní články.',
  ARTICLES_EDIT_ANY: 'Umožní členům upravovat jakékoli články.',
  ARTICLES_DELETE_OWN: 'Umožní členům mazat vlastní články.',
  ARTICLES_DELETE_ANY: 'Umožní členům mazat jakékoli články.',
  ARTICLES_PUBLISH: 'Umožní členům publikovat články (změna stavu na published).',
  ARTICLES_APPROVE: 'Umožní členům schvalovat články (fact-check, korektura).',
  ARTICLES_VIEW_DRAFTS: 'Umožní členům zobrazovat koncepty článků.',
  NEWSLETTER_MANAGE: 'Umožní členům spravovat newsletter a odběratele.',
  STORAGE_UPLOAD: 'Umožní členům nahrávat soubory do úložiště.',
  STORAGE_DELETE: 'Umožní členům mazat soubory z úložiště.',
  STORAGE_MANAGE: 'Umožní členům vytvářet složky a spravovat systémové soubory.',
  USERS_VIEW: 'Umožní členům zobrazovat seznam uživatelů.',
  USERS_MANAGE: 'Umožní členům spravovat uživatele (ban, editace profilů).',
  SUBSCRIPTIONS_VIEW: 'Umožní členům zobrazovat předplatná uživatelů.',
  SUBSCRIPTIONS_MANAGE: 'Umožní členům spravovat předplatná uživatelů.',
  COMMENTS_VIEW: 'Umožní členům zobrazovat komentáře a jejich stav.',
  COMMENTS_MODERATE: 'Umožní členům moderovat a skrývat komentáře bez jejich mazání.',
  COMMENTS_DELETE: 'Umožní členům nenávratně mazat komentáře.',
  REPORTS_VIEW: 'Umožní členům zobrazovat nahlášený obsah a reporty.',
  REPORTS_MANAGE: 'Umožní členům řešit reporty (označit jako vyřešené, eskalovat apod.).',
  ADS_ORGS_MANAGE: 'Umožní členům spravovat reklamní organizace.',
  ADS_CAMPAIGNS_MANAGE: 'Umožní členům spravovat reklamní kampaně.',
  ADS_CALENDAR_VIEW: 'Umožní členům zobrazovat kalendář reklam.',
  REDACTION_MANAGE: 'Umožní členům spravovat tým redakce.',
  PERMISSIONS_MANAGE: 'Umožní členům upravovat role a přiřazovat oprávnění.',
  SETTINGS_MANAGE: 'Umožní členům spravovat nastavení webu a SEO.',
  ADMINISTRATOR: 'Poskytuje všechna oprávnění bez ohledu na ostatní nastavení.',
};

/**
 * Názvy oprávnění pro zobrazení
 */
const PERMISSION_NAMES: Record<PermissionKey, string> = {
  ANALYTICS_VIEW: 'Zobrazit analytiku',
  ANALYTICS_EXPORT: 'Exportovat analytiku',
  OVERVIEW_VIEW: 'Zobrazit přehled',
  SECTIONS_MANAGE: 'Správa sekcí',
  TAGS_MANAGE: 'Správa štítků',
  ARTICLES_VIEW: 'Zobrazit články',
  ARTICLES_CREATE: 'Vytvářet články',
  ARTICLES_EDIT_OWN: 'Upravovat vlastní články',
  ARTICLES_EDIT_ANY: 'Upravovat jakékoli články',
  ARTICLES_DELETE_OWN: 'Mazat vlastní články',
  ARTICLES_DELETE_ANY: 'Mazat jakékoli články',
  ARTICLES_PUBLISH: 'Publikovat články',
  ARTICLES_APPROVE: 'Schvalovat články',
  ARTICLES_VIEW_DRAFTS: 'Zobrazit koncepty',
  NEWSLETTER_MANAGE: 'Správa newsletteru',
  STORAGE_UPLOAD: 'Nahrávat soubory',
  STORAGE_DELETE: 'Mazat soubory',
  STORAGE_MANAGE: 'Správa úložiště',
  USERS_VIEW: 'Zobrazit uživatele',
  USERS_MANAGE: 'Správa uživatelů',
  SUBSCRIPTIONS_VIEW: 'Zobrazit předplatná',
  SUBSCRIPTIONS_MANAGE: 'Správa předplatných',
  COMMENTS_VIEW: 'Zobrazit komentáře',
  COMMENTS_MODERATE: 'Moderovat komentáře',
  COMMENTS_DELETE: 'Mazat komentáře',
  REPORTS_VIEW: 'Zobrazit reporty',
  REPORTS_MANAGE: 'Správa reportů',
  ADS_ORGS_MANAGE: 'Správa reklamních organizací',
  ADS_CAMPAIGNS_MANAGE: 'Správa reklamních kampaní',
  ADS_CALENDAR_VIEW: 'Zobrazit kalendář reklam',
  REDACTION_MANAGE: 'Správa redakce',
  PERMISSIONS_MANAGE: 'Správa oprávnění',
  SETTINGS_MANAGE: 'Správa nastavení',
  ADMINISTRATOR: 'Administrátor',
};

/**
 * Kategorie oprávnění podle permissions.ts
 */
const PERMISSION_CATEGORIES = [
  {
    name: 'Systémové & Nástroje',
    permissions: ['ANALYTICS_VIEW', 'ANALYTICS_EXPORT', 'OVERVIEW_VIEW'] as PermissionKey[],
  },
  {
    name: 'Obsah & Struktura',
    permissions: ['SECTIONS_MANAGE', 'TAGS_MANAGE'] as PermissionKey[],
  },
  {
    name: 'Články',
    permissions: [
      'ARTICLES_VIEW',
      'ARTICLES_CREATE',
      'ARTICLES_EDIT_OWN',
      'ARTICLES_EDIT_ANY',
      'ARTICLES_DELETE_OWN',
      'ARTICLES_DELETE_ANY',
      'ARTICLES_PUBLISH',
      'ARTICLES_APPROVE',
      'ARTICLES_VIEW_DRAFTS',
    ] as PermissionKey[],
  },
  {
    name: 'Newsletter & Úložiště',
    permissions: ['NEWSLETTER_MANAGE', 'STORAGE_UPLOAD', 'STORAGE_DELETE', 'STORAGE_MANAGE'] as PermissionKey[],
  },
  {
    name: 'Uživatelé & Předplatné',
    permissions: ['USERS_VIEW', 'USERS_MANAGE', 'SUBSCRIPTIONS_VIEW', 'SUBSCRIPTIONS_MANAGE'] as PermissionKey[],
  },
  {
    name: 'Komentáře & Moderace',
    permissions: ['COMMENTS_VIEW', 'COMMENTS_MODERATE', 'COMMENTS_DELETE', 'REPORTS_VIEW', 'REPORTS_MANAGE'] as PermissionKey[],
  },
  {
    name: 'Reklamy',
    permissions: ['ADS_ORGS_MANAGE', 'ADS_CAMPAIGNS_MANAGE', 'ADS_CALENDAR_VIEW'] as PermissionKey[],
  },
  {
    name: 'Administrace',
    permissions: ['REDACTION_MANAGE', 'PERMISSIONS_MANAGE', 'SETTINGS_MANAGE'] as PermissionKey[],
  },
  {
    name: 'Speciální',
    permissions: ['ADMINISTRATOR'] as PermissionKey[],
  },
];

export interface PermissionSectionProps {
  permissions: bigint;
  onPermissionsChange: (permissions: bigint) => void;
  searchQuery?: string;
}

/**
 * Komponenta pro Discord-like zobrazení oprávnění s kategoriemi a toggle switches
 */
export function PermissionSection({
  permissions,
  onPermissionsChange,
  searchQuery = '',
}: PermissionSectionProps) {
  const [localSearchQuery, setLocalSearchQuery] = React.useState(searchQuery);

  // Filtrování oprávnění podle vyhledávacího dotazu
  const filteredCategories = useMemo(() => {
    if (!localSearchQuery.trim()) {
      return PERMISSION_CATEGORIES;
    }

    const query = localSearchQuery.toLowerCase();
    return PERMISSION_CATEGORIES.map(category => ({
      ...category,
      permissions: category.permissions.filter(permKey => {
        const name = PERMISSION_NAMES[permKey].toLowerCase();
        const description = PERMISSION_DESCRIPTIONS[permKey].toLowerCase();
        return name.includes(query) || description.includes(query);
      }),
    })).filter(category => category.permissions.length > 0);
  }, [localSearchQuery]);

  const togglePermission = (permissionKey: PermissionKey) => {
    const permission = PERMISSIONS[permissionKey];
    const hasPermission = (permissions & permission) !== BigInt(0);

    if (hasPermission) {
      // Odebrat oprávnění
      onPermissionsChange(permissions & ~permission);
    } else {
      // Přidat oprávnění
      onPermissionsChange(permissions | permission);
    }
  };

  const clearCategoryPermissions = (categoryPermissions: PermissionKey[]) => {
    let newPermissions = permissions;
    for (const permKey of categoryPermissions) {
      const permission = PERMISSIONS[permKey];
      newPermissions = newPermissions & ~permission;
    }
    onPermissionsChange(newPermissions);
  };

  const hasAnyPermissionInCategory = (categoryPermissions: PermissionKey[]) => {
    return categoryPermissions.some(permKey => {
      const permission = PERMISSIONS[permKey];
      return (permissions & permission) !== BigInt(0);
    });
  };

  return (
    <div className="space-y-6">
      {/* Vyhledávací pole */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          value={localSearchQuery}
          onChange={(e) => setLocalSearchQuery(e.target.value)}
          placeholder="Hledat oprávnění"
          className="w-full bg-zinc-800/75 border border-zinc-700/50 rounded-md text-white text-sm tracking-tight font-medium focus:outline-none focus:ring-2 focus:ring-white/75 transition-all pl-10 pr-10 py-2.5"
        />
        {localSearchQuery && (
          <button
            onClick={() => setLocalSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-700 rounded transition-colors cursor-pointer"
          >
            <X size={16} className="text-zinc-400" />
          </button>
        )}
      </div>

      {/* Kategorie oprávnění */}
      <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
        {filteredCategories.map((category) => {
          const hasAny = hasAnyPermissionInCategory(category.permissions);
          
          return (
            <div key={category.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold tracking-tight text-white">
                  {category.name}
                </h3>
                {hasAny && (
                  <button
                    onClick={() => clearCategoryPermissions(category.permissions)}
                    className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer tracking-tight"
                  >
                    Vymazat oprávnění
                  </button>
                )}
              </div>
              <div className="space-y-2 pl-1">
                {category.permissions.map((permKey) => {
                  const permission = PERMISSIONS[permKey];
                  const isEnabled = (permissions & permission) !== BigInt(0);
                  
                  return (
                    <div
                      key={permKey}
                      className="flex items-start justify-between gap-4 p-3 rounded-lg hover:bg-zinc-800/30 transition-colors"
                    >
                      <div className="flex-1 space-y-0.5">
                        <p className="text-sm font-semibold tracking-tight text-white">
                          {PERMISSION_NAMES[permKey]}
                        </p>
                        <p className="text-xs tracking-tight font-medium text-zinc-500">
                          {PERMISSION_DESCRIPTIONS[permKey]}
                        </p>
                      </div>
                      <Toggle
                        checked={isEnabled}
                        onChange={() => togglePermission(permKey)}
                        showLabel={false}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

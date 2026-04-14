export interface DashboardSettings {
  id: string;
  name: string | null;
  seoName: string | null;
  seoAuthor: string | null;
  seoUrl: string | null;
  seoDescription: string | null;
  seoImageUrl: string | null;
  seoHex: string | null;
  registrationEnabled: boolean;
  plunkFromEmail: string | null;
  hasPlunkApiKey: boolean;
}

export interface DashboardSettingsFormData {
  name: string;
  seoName: string;
  seoAuthor: string;
  seoUrl: string;
  seoDescription: string;
  seoImageUrl: string;
  seoHex: string;
  registrationEnabled: boolean;
  plunkFromEmail: string;
  plunkApiKey: string;
}

export type DashboardSettingsPatch = Partial<DashboardSettingsFormData>;

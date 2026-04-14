import { getSettings, upsertSettings } from "@/lib/repositories/settingsRepository";
import { UpdateSettingsSchema } from "@/lib/schemas/settingsSchema";
import { updateSystemPlunkConfig } from "@/lib/services/settingsPlunkService";

export async function getDashboardSettingsService() {
  const settings = await getSettings();
  if (!settings) {
    return null;
  }

  const hasPlunkApiKey = Boolean(
    settings.plunkApiKeyCiphertext &&
      settings.plunkApiKeyIv &&
      settings.plunkApiKeyTag,
  );

  const {
    plunkApiKeyCiphertext,
    plunkApiKeyIv,
    plunkApiKeyTag,
    ...safeSettings
  } = settings;

  return { ...safeSettings, hasPlunkApiKey };
}

export async function updateDashboardSettingsService(data: unknown) {
  const payload = UpdateSettingsSchema.parse(data);

  await updateSystemPlunkConfig({
    apiKey: payload.plunkApiKey,
    fromEmail: payload.plunkFromEmail,
  });

  const { plunkApiKey, plunkFromEmail, ...rest } = payload;

  await upsertSettings(rest);
  const next = await getDashboardSettingsService();
  if (!next) {
    throw new Error("Nepodařilo se načíst uložené nastavení");
  }
  return next;
}

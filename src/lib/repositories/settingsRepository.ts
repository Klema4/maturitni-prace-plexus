import { db } from "@/lib/db";
import { settings } from "@/lib/schema";
import { eq } from "drizzle-orm";

/**
 * Typ nastavení
 */
export type Settings = {
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
  plunkApiKeyCiphertext: string | null;
  plunkApiKeyIv: string | null;
  plunkApiKeyTag: string | null;
};

/**
 * Získání nastavení (vždy jen jeden záznam)
 */
export async function getSettings(): Promise<Settings | null> {
  const result = await db
    .select({
      id: settings.id,
      name: settings.name,
      seoName: settings.seoName,
      seoAuthor: settings.seoAuthor,
      seoUrl: settings.seoUrl,
      seoDescription: settings.seoDescription,
      seoImageUrl: settings.seoImageUrl,
      seoHex: settings.seoHex,
      registrationEnabled: settings.registrationEnabled,
      plunkFromEmail: settings.plunkFromEmail,
      plunkApiKeyCiphertext: settings.plunkApiKeyCiphertext,
      plunkApiKeyIv: settings.plunkApiKeyIv,
      plunkApiKeyTag: settings.plunkApiKeyTag,
    })
    .from(settings)
    .limit(1);

  return result[0] || null;
}

/**
 * Vytvoření nebo aktualizace nastavení
 * Vždy existuje jen jeden záznam nastavení
 */
export async function upsertSettings(data: {
  name?: string | null;
  seoName?: string | null;
  seoAuthor?: string | null;
  seoUrl?: string | null;
  seoDescription?: string | null;
  seoImageUrl?: string | null;
  seoHex?: string | null;
  registrationEnabled?: boolean;
  plunkFromEmail?: string | null;
  plunkApiKeyCiphertext?: string | null;
  plunkApiKeyIv?: string | null;
  plunkApiKeyTag?: string | null;
}): Promise<Settings> {
  // Zkusit získat existující nastavení
  const existing = await getSettings();

  if (existing) {
    // Aktualizovat existující
    const result = await db
      .update(settings)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.seoName !== undefined && { seoName: data.seoName }),
        ...(data.seoAuthor !== undefined && { seoAuthor: data.seoAuthor }),
        ...(data.seoUrl !== undefined && { seoUrl: data.seoUrl }),
        ...(data.seoDescription !== undefined && { seoDescription: data.seoDescription }),
        ...(data.seoImageUrl !== undefined && { seoImageUrl: data.seoImageUrl }),
        ...(data.seoHex !== undefined && { seoHex: data.seoHex }),
        ...(data.registrationEnabled !== undefined && { registrationEnabled: data.registrationEnabled }),
        ...(data.plunkFromEmail !== undefined && { plunkFromEmail: data.plunkFromEmail }),
        ...(data.plunkApiKeyCiphertext !== undefined && { plunkApiKeyCiphertext: data.plunkApiKeyCiphertext }),
        ...(data.plunkApiKeyIv !== undefined && { plunkApiKeyIv: data.plunkApiKeyIv }),
        ...(data.plunkApiKeyTag !== undefined && { plunkApiKeyTag: data.plunkApiKeyTag }),
      })
      .where(eq(settings.id, existing.id))
      .returning({
        id: settings.id,
        name: settings.name,
        seoName: settings.seoName,
        seoAuthor: settings.seoAuthor,
        seoUrl: settings.seoUrl,
        seoDescription: settings.seoDescription,
        seoImageUrl: settings.seoImageUrl,
        seoHex: settings.seoHex,
        registrationEnabled: settings.registrationEnabled,
        plunkFromEmail: settings.plunkFromEmail,
        plunkApiKeyCiphertext: settings.plunkApiKeyCiphertext,
        plunkApiKeyIv: settings.plunkApiKeyIv,
        plunkApiKeyTag: settings.plunkApiKeyTag,
      });

    return result[0];
  } else {
    // Vytvořit nové
    const result = await db
      .insert(settings)
      .values({
        name: data.name || null,
        seoName: data.seoName || null,
        seoAuthor: data.seoAuthor || null,
        seoUrl: data.seoUrl || null,
        seoDescription: data.seoDescription || null,
        seoImageUrl: data.seoImageUrl || null,
        seoHex: data.seoHex || null,
        registrationEnabled: data.registrationEnabled !== undefined ? data.registrationEnabled : true,
        plunkFromEmail: data.plunkFromEmail ?? null,
        plunkApiKeyCiphertext: data.plunkApiKeyCiphertext ?? null,
        plunkApiKeyIv: data.plunkApiKeyIv ?? null,
        plunkApiKeyTag: data.plunkApiKeyTag ?? null,
      })
      .returning({
        id: settings.id,
        name: settings.name,
        seoName: settings.seoName,
        seoAuthor: settings.seoAuthor,
        seoUrl: settings.seoUrl,
        seoDescription: settings.seoDescription,
        seoImageUrl: settings.seoImageUrl,
        seoHex: settings.seoHex,
        registrationEnabled: settings.registrationEnabled,
        plunkFromEmail: settings.plunkFromEmail,
        plunkApiKeyCiphertext: settings.plunkApiKeyCiphertext,
        plunkApiKeyIv: settings.plunkApiKeyIv,
        plunkApiKeyTag: settings.plunkApiKeyTag,
      });

    return result[0];
  }
}

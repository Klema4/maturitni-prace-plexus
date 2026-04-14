import { getSettings, upsertSettings } from "@/lib/repositories/settingsRepository";
import { decryptSecret, encryptSecret } from "@/utils/secretsEncryption";

/**
 * Načte Plunk konfiguraci pro systémové emaily (z tabulky settings).
 *
 * @returns {Promise<{ apiKey: string | null; fromEmail: string | null }>} Plunk API key a from email.
 */
export async function getSystemPlunkConfig(): Promise<{
  apiKey: string | null;
  fromEmail: string | null;
}> {
  const settings = await getSettings();

  if (!settings) {
    return { apiKey: null, fromEmail: null };
  }

  const fromEmail = settings.plunkFromEmail ?? null;

  if (
    !settings.plunkApiKeyCiphertext ||
    !settings.plunkApiKeyIv ||
    !settings.plunkApiKeyTag
  ) {
    return { apiKey: null, fromEmail };
  }

  const apiKey = decryptSecret({
    ciphertextB64: settings.plunkApiKeyCiphertext,
    ivB64: settings.plunkApiKeyIv,
    tagB64: settings.plunkApiKeyTag,
  });

  return { apiKey, fromEmail };
}

/**
 * Uloží Plunk konfiguraci pro systémové emaily do settings (API key šifrovaně).
 *
 * @param {Object} params - Parametry uložení.
 * @param {string | null | undefined} params.apiKey - Nový Plunk API key (plaintext). Pokud je undefined, nemění se.
 * @param {string | null | undefined} params.fromEmail - Odesílací email. Pokud je undefined, nemění se.
 * @returns {Promise<void>} Bez návratové hodnoty.
 */
export async function updateSystemPlunkConfig(params: {
  apiKey?: string | null;
  fromEmail?: string | null;
}): Promise<void> {
  const patch: {
    plunkFromEmail?: string | null;
    plunkApiKeyCiphertext?: string | null;
    plunkApiKeyIv?: string | null;
    plunkApiKeyTag?: string | null;
  } = {};

  if (params.fromEmail !== undefined) {
    patch.plunkFromEmail = params.fromEmail;
  }

  if (params.apiKey !== undefined) {
    if (!params.apiKey) {
      patch.plunkApiKeyCiphertext = null;
      patch.plunkApiKeyIv = null;
      patch.plunkApiKeyTag = null;
    } else {
      const encrypted = encryptSecret(params.apiKey);
      patch.plunkApiKeyCiphertext = encrypted.ciphertextB64;
      patch.plunkApiKeyIv = encrypted.ivB64;
      patch.plunkApiKeyTag = encrypted.tagB64;
    }
  }

  if (Object.keys(patch).length === 0) {
    return;
  }

  await upsertSettings(patch);
}


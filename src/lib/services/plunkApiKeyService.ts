import {
  getOrganizationIntegrationsByOrganizationId,
} from "@/lib/repositories/organizationIntegrationsRepository";
import { decryptSecret, encryptSecret } from "@/utils/secretsEncryption";

/**
 * Načte Plunk "from" email pro organizaci, pokud je uložený v DB.
 *
 * @param {string} organizationId - ID organizace.
 * @returns {Promise<string | null>} Odesílací email nebo null.
 */
export async function getPlunkFromEmailForOrganization(
  organizationId: string,
): Promise<string | null> {
  const integrations = await getOrganizationIntegrationsByOrganizationId(
    organizationId,
  );
  return integrations?.plunkFromEmail ?? null;
}

/**
 * Načte Plunk API klíč pro organizaci (dešifrovaný), pokud je uložený v DB.
 *
 * @param {string} organizationId - ID organizace.
 * @returns {Promise<string | null>} Dešifrovaný Plunk API key nebo null.
 */
export async function getPlunkApiKeyForOrganization(
  organizationId: string,
): Promise<string | null> {
  const integrations = await getOrganizationIntegrationsByOrganizationId(
    organizationId,
  );

  if (
    !integrations?.plunkApiKeyCiphertext ||
    !integrations.plunkApiKeyIv ||
    !integrations.plunkApiKeyTag
  ) {
    return null;
  }

  return decryptSecret({
    ciphertextB64: integrations.plunkApiKeyCiphertext,
    ivB64: integrations.plunkApiKeyIv,
    tagB64: integrations.plunkApiKeyTag,
  });
}

/**
 * Pomocná funkce pro přípravu šifrovaného payloadu pro DB z plaintext klíče.
 *
 * @param {string} apiKey - Plunk API klíč v plaintextu.
 * @returns {{ ciphertextB64: string; ivB64: string; tagB64: string }} Šifrovaný payload.
 */
export function encryptPlunkApiKey(apiKey: string): {
  ciphertextB64: string;
  ivB64: string;
  tagB64: string;
} {
  return encryptSecret(apiKey);
}


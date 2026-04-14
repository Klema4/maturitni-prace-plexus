import { db } from "@/lib/db";
import { organizationIntegrations } from "@/lib/schema";
import { eq } from "drizzle-orm";

/**
 * Integrace organizace (uložené tajné klíče v DB).
 */
export type OrganizationIntegrations = {
  organizationId: string;
  plunkFromEmail: string | null;
  plunkApiKeyCiphertext: string | null;
  plunkApiKeyIv: string | null;
  plunkApiKeyTag: string | null;
  updatedAt: Date;
};

/**
 * Načte integrace organizace (pokud existují).
 *
 * @param {string} organizationId - ID organizace.
 * @returns {Promise<OrganizationIntegrations | null>} Záznam integrace nebo null.
 */
export async function getOrganizationIntegrationsByOrganizationId(
  organizationId: string,
): Promise<OrganizationIntegrations | null> {
  const result = await db
    .select({
      organizationId: organizationIntegrations.organizationId,
      plunkFromEmail: organizationIntegrations.plunkFromEmail,
      plunkApiKeyCiphertext: organizationIntegrations.plunkApiKeyCiphertext,
      plunkApiKeyIv: organizationIntegrations.plunkApiKeyIv,
      plunkApiKeyTag: organizationIntegrations.plunkApiKeyTag,
      updatedAt: organizationIntegrations.updatedAt,
    })
    .from(organizationIntegrations)
    .where(eq(organizationIntegrations.organizationId, organizationId))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Uloží (nebo aktualizuje) Plunk odesílací email pro organizaci.
 *
 * @param {Object} params - Parametry uložení.
 * @param {string} params.organizationId - ID organizace.
 * @param {string | null} params.fromEmail - Odesílací email (musí odpovídat nastavení v Plunku).
 * @returns {Promise<OrganizationIntegrations>} Aktualizovaný záznam.
 */
export async function upsertOrganizationPlunkFromEmail(params: {
  organizationId: string;
  fromEmail: string | null;
}): Promise<OrganizationIntegrations> {
  const existing = await getOrganizationIntegrationsByOrganizationId(
    params.organizationId,
  );

  if (existing) {
    const updated = await db
      .update(organizationIntegrations)
      .set({
        plunkFromEmail: params.fromEmail,
        updatedAt: new Date(),
      })
      .where(eq(organizationIntegrations.organizationId, params.organizationId))
      .returning({
        organizationId: organizationIntegrations.organizationId,
        plunkFromEmail: organizationIntegrations.plunkFromEmail,
        plunkApiKeyCiphertext: organizationIntegrations.plunkApiKeyCiphertext,
        plunkApiKeyIv: organizationIntegrations.plunkApiKeyIv,
        plunkApiKeyTag: organizationIntegrations.plunkApiKeyTag,
        updatedAt: organizationIntegrations.updatedAt,
      });

    return updated[0];
  }

  const inserted = await db
    .insert(organizationIntegrations)
    .values({
      organizationId: params.organizationId,
      plunkFromEmail: params.fromEmail,
      updatedAt: new Date(),
    })
    .returning({
      organizationId: organizationIntegrations.organizationId,
      plunkFromEmail: organizationIntegrations.plunkFromEmail,
      plunkApiKeyCiphertext: organizationIntegrations.plunkApiKeyCiphertext,
      plunkApiKeyIv: organizationIntegrations.plunkApiKeyIv,
      plunkApiKeyTag: organizationIntegrations.plunkApiKeyTag,
      updatedAt: organizationIntegrations.updatedAt,
    });

  return inserted[0];
}

/**
 * Uloží (nebo aktualizuje) šifrovaný Plunk API key pro organizaci.
 *
 * @param {Object} params - Parametry uložení.
 * @param {string} params.organizationId - ID organizace.
 * @param {string} params.ciphertextB64 - Ciphertext v base64.
 * @param {string} params.ivB64 - IV v base64.
 * @param {string} params.tagB64 - Auth tag v base64.
 * @returns {Promise<OrganizationIntegrations>} Aktualizovaný záznam.
 */
export async function upsertOrganizationPlunkApiKey(params: {
  organizationId: string;
  ciphertextB64: string;
  ivB64: string;
  tagB64: string;
}): Promise<OrganizationIntegrations> {
  const existing = await getOrganizationIntegrationsByOrganizationId(
    params.organizationId,
  );

  if (existing) {
    const updated = await db
      .update(organizationIntegrations)
      .set({
        plunkApiKeyCiphertext: params.ciphertextB64,
        plunkApiKeyIv: params.ivB64,
        plunkApiKeyTag: params.tagB64,
        updatedAt: new Date(),
      })
      .where(eq(organizationIntegrations.organizationId, params.organizationId))
      .returning({
        organizationId: organizationIntegrations.organizationId,
        plunkFromEmail: organizationIntegrations.plunkFromEmail,
        plunkApiKeyCiphertext: organizationIntegrations.plunkApiKeyCiphertext,
        plunkApiKeyIv: organizationIntegrations.plunkApiKeyIv,
        plunkApiKeyTag: organizationIntegrations.plunkApiKeyTag,
        updatedAt: organizationIntegrations.updatedAt,
      });

    return updated[0];
  }

  const inserted = await db
    .insert(organizationIntegrations)
    .values({
      organizationId: params.organizationId,
      plunkApiKeyCiphertext: params.ciphertextB64,
      plunkApiKeyIv: params.ivB64,
      plunkApiKeyTag: params.tagB64,
      updatedAt: new Date(),
    })
    .returning({
      organizationId: organizationIntegrations.organizationId,
      plunkFromEmail: organizationIntegrations.plunkFromEmail,
      plunkApiKeyCiphertext: organizationIntegrations.plunkApiKeyCiphertext,
      plunkApiKeyIv: organizationIntegrations.plunkApiKeyIv,
      plunkApiKeyTag: organizationIntegrations.plunkApiKeyTag,
      updatedAt: organizationIntegrations.updatedAt,
    });

  return inserted[0];
}


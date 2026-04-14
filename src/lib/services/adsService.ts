import {
   getAllOrganizations,
   getOrganizationsWithCampaignCount,
   getOrganizationById,
   createOrganization,
   updateOrganization,
   deleteOrganization,
   searchOrganizations,
   hasActiveOrganizationMembership,
} from "@/lib/repositories/organizationsRepository";
import {
   getAllCampaigns,
   getCampaignsWithOrganization,
   getCampaignById,
   getActiveCampaigns,
   getActiveCampaignsForPublicDisplay,
   getPlannedCampaigns,
   getCampaignsByOrganizationId,
   createCampaign,
   updateCampaign,
   deleteCampaign,
} from "@/lib/repositories/campaignsRepository";
import {
   CreateOrganizationSchema,
   UpdateOrganizationSchema,
} from "@/lib/schemas/organizationsSchema";
import {
   CreateCampaignSchema,
   UpdateCampaignSchema,
} from "@/lib/schemas/campaignsSchema";
import {
   createOrganizationApplication,
   approveOrganizationApplication,
   getActiveApplicationByApplicantUserId,
   getOrganizationApplicationById,
   getLatestApplicationByApplicantUserId,
   listOrganizationApplications,
   rejectOrganizationApplication,
   countPendingOrganizationApplications,
} from "@/lib/repositories/organizationApplicationsRepository";
import {
   CreateOrganizationApplicationSchema,
   ReviewOrganizationApplicationSchema,
} from "@/lib/schemas/organizationApplicationsSchema";
import { sendEmailWithPlunk } from "@/lib/services/emailService";

/**
 * Organizace
 */

/**
 * Získání všech organizací
 */
export async function getAllOrganizationsService() {
   return await getAllOrganizations();
}

/**
 * Získání organizací s počtem kampaní
 */
export async function getOrganizationsWithCampaignCountService() {
   return await getOrganizationsWithCampaignCount();
}

/**
 * Získání organizace podle ID
 */
export async function getOrganizationByIdService(organizationId: string) {
   return await getOrganizationById(organizationId);
}

/**
 * Vytvoření nové organizace
 */
export async function createOrganizationService(data: unknown) {
   const validatedData = CreateOrganizationSchema.parse(data);
   return await createOrganization(validatedData);
}

/**
 * Aktualizace organizace
 */
export async function updateOrganizationService(
   organizationId: string,
   data: unknown,
) {
   const validatedData = UpdateOrganizationSchema.parse(data);
   return await updateOrganization(organizationId, validatedData);
}

/**
 * Smazání organizace
 */
export async function deleteOrganizationService(organizationId: string) {
   return await deleteOrganization(organizationId);
}

/**
 * Vyhledávání organizací
 */
export async function searchOrganizationsService(query: string) {
   return await searchOrganizations(query);
}

/**
 * Kampaně
 */

/**
 * Získání všech kampaní
 */
export async function getAllCampaignsService() {
   return await getCampaignsWithOrganization();
}

/**
 * Získání kampaně podle ID
 */
export async function getCampaignByIdService(campaignId: string) {
   return await getCampaignById(campaignId);
}

/**
 * Získání aktivních kampaní
 */
export async function getActiveCampaignsService(date?: Date) {
   return await getActiveCampaigns(date);
}

/**
 * Získání plánovaných kampaní
 */
export async function getPlannedCampaignsService(date?: Date) {
   return await getPlannedCampaigns(date);
}

function getStableIndex(seed: string, size: number) {
   let hash = 0;

   for (let index = 0; index < seed.length; index += 1) {
      hash = (hash * 31 + seed.charCodeAt(index)) | 0;
   }

   return Math.abs(hash) % size;
}

/**
 * Vybere náhodný index v rozsahu 0..size-1.
 * Použije kryptograficky bezpečný RNG, pokud je k dispozici.
 * @param {number} size - Velikost pole.
 * @return {number} Náhodný index.
 */
function getRandomIndex(size: number): number {
   if (size <= 1) return 0;

   const cryptoAny = globalThis.crypto as unknown as { randomInt?: (min: number, max: number) => number } | undefined;
   if (cryptoAny?.randomInt) {
      return cryptoAny.randomInt(0, size);
   }

   return Math.floor(Math.random() * size);
}

export async function getPublicAdCampaignService(slot: string = "default") {
   const campaigns = await getActiveCampaignsForPublicDisplay();

   if (campaigns.length === 0) {
      return null;
   }

   // Dříve: stabilní výběr na hodinu. Pro "náhodné" reklamy v článcích chceme
   // nový výběr na každé načtení (noStore je řešeno výše v public API).
   const pickedIndex =
      slot === "article-inline"
         ? getRandomIndex(campaigns.length)
         : getStableIndex(`${slot}:${new Date().toISOString().slice(0, 13)}`, campaigns.length);

   return campaigns[pickedIndex] ?? null;
}

/**
 * Získání kampaní podle organizace
 */
export async function getCampaignsByOrganizationIdService(
   organizationId: string,
) {
   return await getCampaignsByOrganizationId(organizationId);
}

/**
 * Vytvoření nové kampaně
 */
export async function createCampaignService(data: unknown) {
   const validatedData = CreateCampaignSchema.parse(data);

   const processedData = {
      ...validatedData,
      startingAt: new Date(validatedData.startingAt),
      endingAt: new Date(validatedData.endingAt),
   };

   return await createCampaign(processedData);
}

/**
 * Aktualizace kampaně
 */
export async function updateCampaignService(campaignId: string, data: unknown) {
   const validatedData = UpdateCampaignSchema.parse(data);

   const processedData = {
      ...validatedData,
      startingAt: validatedData.startingAt
         ? new Date(validatedData.startingAt)
         : undefined,
      endingAt: validatedData.endingAt
         ? new Date(validatedData.endingAt)
         : undefined,
   };

   return await updateCampaign(campaignId, processedData);
}

/**
 * Smazání kampaně
 */
export async function deleteCampaignService(campaignId: string) {
   return await deleteCampaign(campaignId);
}

export async function canAccessAdsDashboardService(userId: string) {
   return await hasActiveOrganizationMembership(userId);
}

/**
 * Firemní onboarding - registrace do reklamy sítě
 */

export class ActiveOrganizationApplicationExistsError extends Error {
   constructor() {
      super("Aktivní žádost už existuje");
      this.name = "ActiveOrganizationApplicationExistsError";
   }
}

export class OrganizationApplicationNotFoundError extends Error {
   constructor() {
      super("Žádost nebyla nalezena");
      this.name = "OrganizationApplicationNotFoundError";
   }
}

export class OrganizationApplicationInvalidStateError extends Error {
   constructor() {
      super("Žádost není v validním stavu pro tuto akci");
      this.name = "OrganizationApplicationInvalidStateError";
   }
}

export async function getMyOrganizationApplicationService(userId: string) {
   return await getLatestApplicationByApplicantUserId(userId);
}

export async function submitOrganizationApplicationService(
   userId: string,
   data: unknown,
) {
   const validatedData = CreateOrganizationApplicationSchema.parse(data);
   const existing = await getActiveApplicationByApplicantUserId(userId);

   if (existing) {
      throw new ActiveOrganizationApplicationExistsError();
   }

   return await createOrganizationApplication({
      applicantUserId: userId,
      ...validatedData,
   });
}

export async function listOrganizationApplicationsService(status?: string) {
   return await listOrganizationApplications(status);
}

/**
 * Počet firemních žádostí čekajících na vyřízení (submitted, under_review).
 * @returns {Promise<number>} Počet pending žádostí.
 */
export async function getPendingRegistrationsCountService(): Promise<number> {
   return await countPendingOrganizationApplications();
}

export async function approveOrganizationApplicationService(
   applicationId: string,
   reviewerUserId: string,
) {
   const existing = await getOrganizationApplicationById(applicationId);
   if (!existing) {
      throw new OrganizationApplicationNotFoundError();
   }

   try {
      const application = await approveOrganizationApplication({
         applicationId,
         reviewerUserId,
      });

      if (!application) {
         throw new OrganizationApplicationNotFoundError();
      }

      // Email notifikace – schválení žádosti
      const dashboardUrl = `${process.env.SITE_URL ?? "http://localhost:3000"}/ads/dashboard`;
      const approvedBody = `<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charSet="UTF-8" />
    <title>Žádost o firemní účet schválena - Plexus</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;">
    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:600px;background-color:#ffffff;border-radius:16px;padding:24px;border:1px solid #e5e7eb;">
            <tr>
              <td style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#111827;">Žádost o firemní účet schválena - Plexus</h1>
                <p style="margin:0 0 16px;font-size:14px;color:#111827;">Dobrý den,</p>
                <p style="margin:0 0 16px;font-size:14px;color:#111827;">
                  vaše žádost o registraci firmy <strong>${application.companyName}</strong> do reklamní sítě Plexus byla
                  <strong>schválena</strong>.
                </p>
                <p style="margin:0 0 16px;font-size:14px;color:#111827;">
                  Nyní máte přístup k&nbsp;reklamnímu dashboardu a můžete začít spravovat své kampaně.
                </p>
                <p style="margin:0 0 24px;">
                  <a
                    href="${dashboardUrl}"
                    style="display:inline-block;padding:10px 18px;border-radius:9999px;background-color:#111827;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;"
                  >
                    Otevřít reklamní dashboard
                  </a>
                </p>
                <p style="margin:0 0 16px;font-size:14px;color:#111827;">
                  Přihlaste se do Plexus a pokračujte na stránku reklamního dashboardu, kde můžete založit první kampaň.
                </p>
                <p style="margin:0;font-size:14px;color:#111827;">
                  S pozdravem,<br />tým Plexus
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

      void sendEmailWithPlunk({
         to: application.email,
         subject:
            "Vaše žádost o firemní účet v reklamní síti Plexus byla schválena",
         body: approvedBody,
      });

      return application;
   } catch (error: any) {
      if (error?.message === "INVALID_APPLICATION_STATE") {
         throw new OrganizationApplicationInvalidStateError();
      }
      throw error;
   }
}

export async function rejectOrganizationApplicationService(
   applicationId: string,
   reviewerUserId: string,
   data: unknown,
) {
   const payload = ReviewOrganizationApplicationSchema.parse(data);
   const existing = await getOrganizationApplicationById(applicationId);
   if (!existing) {
      throw new OrganizationApplicationNotFoundError();
   }

   try {
      const application = await rejectOrganizationApplication({
         applicationId,
         reviewerUserId,
         rejectionReason: payload.rejectionReason,
      });

      if (!application) {
         throw new OrganizationApplicationNotFoundError();
      }

      // Email notifikace – zamítnutí žádosti
      const rejectionReason = application.rejectionReason || payload.rejectionReason;
      const registrationUrl = `${process.env.SITE_URL ?? "http://localhost:3000"}/firmy/registrace`;
      const rejectedBody = `<!DOCTYPE html>
<html lang="cs">
  <head>
    <meta charSet="UTF-8" />
    <title>Žádost o firemní účet zamítnuta - Plexus</title>
  </head>
  <body style="margin:0;padding:0;background-color:#f3f4f6;">
    <table width="100%" cellPadding="0" cellSpacing="0" role="presentation">
      <tr>
        <td align="center" style="padding:24px 16px;">
          <table width="100%" cellPadding="0" cellSpacing="0" role="presentation" style="max-width:600px;background-color:#ffffff;border-radius:16px;padding:24px;border:1px solid #e5e7eb;">
            <tr>
              <td style="font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                <h1 style="margin:0 0 16px;font-size:20px;font-weight:600;color:#111827;">Žádost o firemní účet zamítnuta - Plexus</h1>
                <p style="margin:0 0 16px;font-size:14px;color:#111827;">Dobrý den,</p>
                <p style="margin:0 0 16px;font-size:14px;color:#111827;">
                  vaše žádost o registraci firmy <strong>${application.companyName}</strong> do reklamní sítě Plexus byla
                  <strong>zamítnuta</strong>.
                </p>
                <p style="margin:0 0 16px;font-size:14px;color:#111827;">
                  Důvod zamítnutí:
                </p>
                <p
                  style="margin:0 0 24px;font-size:14px;padding:12px 14px;border-radius:8px;background-color:#fef2f2;color:#b91c1c;"
                >
                  ${rejectionReason}
                </p>
                <p style="margin:0 0 16px;font-size:14px;color:#111827;">
                  Po úpravě údajů můžete podat novou žádost na stránce registrace firmy:
                </p>
                <p style="margin:0 0 24px;">
                  <a
                    href="${registrationUrl}"
                    style="display:inline-block;padding:10px 18px;border-radius:9999px;background-color:#111827;color:#ffffff;font-size:14px;font-weight:500;text-decoration:none;"
                  >
                    Otevřít stránku registrace firmy
                  </a>
                </p>
                <p style="margin:0;font-size:14px;color:#111827;">
                  S pozdravem,<br />tým Plexus
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

      void sendEmailWithPlunk({
         to: application.email,
         subject:
            "Vaše žádost o firemní účet v reklamní síti Plexus byla zamítnuta",
         body: rejectedBody,
      });

      return application;
   } catch (error: any) {
      if (error?.message === "INVALID_APPLICATION_STATE") {
         throw new OrganizationApplicationInvalidStateError();
      }
      throw error;
   }
}

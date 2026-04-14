import { z } from "zod";

/**
 * Schéma pro kampaň
 */
export const CampaignSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  stripeCampaignId: z.string().uuid().nullable(),
  name: z.string().min(1).max(256),
  description: z.string().max(1024).nullable(),
  bannerImageUrl: z.string().url().max(1024).nullable(),
  bannerUrl: z.string().url().max(4096).nullable(),
  startingAt: z.date(),
  endingAt: z.date(),
  viewCount: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

/**
 * Schéma pro vytvoření kampaně
 */
export const CreateCampaignSchema = z.object({
  organizationId: z.string().uuid(),
  stripeCampaignId: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(256),
  description: z.string().max(1024).optional().nullable(),
  bannerImageUrl: z.string().url().max(1024).optional().nullable(),
  bannerUrl: z.string().url().max(4096).optional().nullable(),
  startingAt: z.string().datetime(),
  endingAt: z.string().datetime(),
}).refine((data) => {
  const start = new Date(data.startingAt);
  const end = new Date(data.endingAt);
  return end > start;
}, {
  message: "Konec kampaně musí být později než začátek",
  path: ["endingAt"],
});

export type CreateCampaign = z.infer<typeof CreateCampaignSchema>;

/**
 * Schéma pro aktualizaci kampaně
 * Nemůžeme použít .partial() na schéma s .refine(), takže vytvoříme nové schéma
 */
export const UpdateCampaignSchema = z.object({
  organizationId: z.string().uuid().optional(),
  stripeCampaignId: z.string().uuid().optional().nullable(),
  name: z.string().min(1).max(256).optional(),
  description: z.string().max(1024).optional().nullable(),
  bannerImageUrl: z.string().url().max(1024).optional().nullable(),
  bannerUrl: z.string().url().max(4096).optional().nullable(),
  startingAt: z.string().datetime().optional(),
  endingAt: z.string().datetime().optional(),
}).refine((data) => {
  // Refine pouze pokud jsou oba datumy přítomny
  if (data.startingAt && data.endingAt) {
    const start = new Date(data.startingAt);
    const end = new Date(data.endingAt);
    return end > start;
  }
  return true;
}, {
  message: "Konec kampaně musí být později než začátek",
  path: ["endingAt"],
});

export type UpdateCampaign = z.infer<typeof UpdateCampaignSchema>;

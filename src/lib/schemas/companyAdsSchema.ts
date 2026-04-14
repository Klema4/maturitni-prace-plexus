import { z } from "zod";

export const CompanyAdsRoleSchema = z.enum(["owner", "manager", "viewer"]);
export const ManageableCompanyAdsRoleSchema = z.enum(["manager", "viewer"]);

export const CreateCompanyAdsCampaignSchema = z
  .object({
    name: z.string().trim().min(1).max(256),
    description: z.string().trim().max(1024).optional().nullable(),
    bannerImageUrl: z.union([z.string().url().max(1024), z.literal("")]).optional(),
    bannerUrl: z.union([z.string().url().max(4096), z.literal("")]).optional(),
    startingAt: z.string().datetime(),
    endingAt: z.string().datetime(),
  })
  .transform((data) => ({
    ...data,
    description: data.description && data.description.trim() ? data.description.trim() : null,
    bannerImageUrl: data.bannerImageUrl && data.bannerImageUrl.trim() ? data.bannerImageUrl.trim() : null,
    bannerUrl: data.bannerUrl && data.bannerUrl.trim() ? data.bannerUrl.trim() : null,
  }))
  .refine(
    (data) => new Date(data.endingAt).getTime() > new Date(data.startingAt).getTime(),
    {
      message: "Konec kampaně musí být později než začátek",
      path: ["endingAt"],
    },
  );

export const UpdateCompanyAdsCampaignSchema = z
  .object({
    name: z.string().trim().min(1).max(256).optional(),
    description: z.string().trim().max(1024).optional().nullable(),
    bannerImageUrl: z.union([z.string().url().max(1024), z.literal("")]).optional(),
    bannerUrl: z.union([z.string().url().max(4096), z.literal("")]).optional(),
    startingAt: z.string().datetime().optional(),
    endingAt: z.string().datetime().optional(),
  })
  .transform((data) => ({
    ...data,
    description:
      data.description === undefined
        ? undefined
        : data.description && data.description.trim()
          ? data.description.trim()
          : null,
    bannerImageUrl:
      data.bannerImageUrl === undefined
        ? undefined
        : data.bannerImageUrl && data.bannerImageUrl.trim()
          ? data.bannerImageUrl.trim()
          : null,
    bannerUrl:
      data.bannerUrl === undefined
        ? undefined
        : data.bannerUrl && data.bannerUrl.trim()
          ? data.bannerUrl.trim()
          : null,
  }))
  .refine(
    (data) => {
      if (!data.startingAt || !data.endingAt) {
        return true;
      }
      return new Date(data.endingAt).getTime() > new Date(data.startingAt).getTime();
    },
    {
      message: "Konec kampaně musí být později než začátek",
      path: ["endingAt"],
    },
  );

export const CreateCompanyAdsInviteSchema = z.object({
  email: z.string().trim().email().max(128),
  role: ManageableCompanyAdsRoleSchema,
});

export const AcceptCompanyAdsInviteSchema = z.object({
  token: z.string().trim().min(16).max(128),
});

export const UpdateCompanyAdsMemberRoleSchema = z.object({
  userId: z.string().uuid(),
  role: ManageableCompanyAdsRoleSchema,
});

export const UpdateCompanyAdsSettingsSchema = z
  .object({
    name: z.string().trim().min(1).max(64),
    imageUrl: z.union([z.string().url().max(1024), z.literal("")]).optional(),
    websiteUrl: z.union([z.string().url().max(128), z.literal("")]).optional(),
    email: z.string().trim().email().max(128),
    phone: z.string().trim().max(128),
    location: z.string().trim().max(128),
    ico: z.union([z.string().trim().max(9), z.literal("")]).optional(),
  })
  .transform((data) => ({
    ...data,
    imageUrl: data.imageUrl && data.imageUrl.trim() ? data.imageUrl.trim() : undefined,
    websiteUrl: data.websiteUrl && data.websiteUrl.trim() ? data.websiteUrl.trim() : null,
    ico: data.ico && data.ico.trim() ? data.ico.trim() : null,
  }));

export type CompanyAdsRole = z.infer<typeof CompanyAdsRoleSchema>;
export type ManageableCompanyAdsRole = z.infer<typeof ManageableCompanyAdsRoleSchema>;
export type CreateCompanyAdsCampaign = z.infer<typeof CreateCompanyAdsCampaignSchema>;
export type UpdateCompanyAdsCampaign = z.infer<typeof UpdateCompanyAdsCampaignSchema>;
export type CreateCompanyAdsInvite = z.infer<typeof CreateCompanyAdsInviteSchema>;
export type AcceptCompanyAdsInvite = z.infer<typeof AcceptCompanyAdsInviteSchema>;
export type UpdateCompanyAdsMemberRole = z.infer<typeof UpdateCompanyAdsMemberRoleSchema>;
export type UpdateCompanyAdsSettings = z.infer<typeof UpdateCompanyAdsSettingsSchema>;

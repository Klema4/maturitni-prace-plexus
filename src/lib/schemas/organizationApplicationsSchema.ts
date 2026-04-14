import { z } from "zod";

export const OrganizationApplicationStatusSchema = z.enum([
   "submitted",
   "under_review",
   "approved",
   "rejected",
   "withdrawn",
]);

export const CreateOrganizationApplicationSchema = z.object({
   companyName: z.string().min(1).max(64),
   websiteUrl: z
      .union([z.string().url().max(128), z.literal("")])
      .optional()
      .transform((value) => (value && value.trim() ? value : undefined)),
   email: z.string().email().max(128),
   phone: z.string().min(1).max(128),
   location: z.string().min(1).max(128),
   ico: z
      .union([z.string().regex(/^\d{8,9}$/), z.literal("")])
      .optional()
      .transform((value) => (value && value.trim() ? value : undefined)),
   note: z
      .union([z.string().max(2048), z.literal("")])
      .optional()
      .transform((value) => (value && value.trim() ? value : undefined)),
});

export type CreateOrganizationApplication = z.infer<
   typeof CreateOrganizationApplicationSchema
>;

export const ReviewOrganizationApplicationSchema = z.object({
   rejectionReason: z.string().min(1).max(1024),
});

export const ListOrganizationApplicationsQuerySchema = z.object({
   status: OrganizationApplicationStatusSchema.optional(),
});

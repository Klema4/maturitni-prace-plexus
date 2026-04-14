import { z } from "zod";

const OrganizationImageSchema = z.union([
  z.string().url().max(1024),
  z.string().startsWith("/").max(1024),
]);

/**
 * Schéma pro organizaci
 */
export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(64),
  imageUrl: OrganizationImageSchema,
  websiteUrl: z.string().url().max(128).nullable(),
  email: z.string().email().max(128),
  phone: z.string().max(128),
  location: z.string().max(128),
  ico: z.string().max(9).nullable(),
  verified: z.boolean(),
  maxStorageBytes: z.number().int().positive(),
  usedStorageBytes: z.number().int().nonnegative(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

/**
 * Schéma pro vytvoření organizace
 */
export const CreateOrganizationSchema = z.object({
  name: z.string().min(1).max(64),
  imageUrl: z.union([OrganizationImageSchema, z.literal("")]).optional(),
  websiteUrl: z.union([z.string().url().max(128), z.literal("")]).nullable().optional(),
  email: z.string().email().max(128),
  phone: z.string().max(128),
  location: z.string().max(128),
  ico: z.union([z.string().max(9), z.literal("")]).nullable().optional(),
  verified: z.boolean().optional(),
  maxStorageBytes: z.number().int().positive().optional(),
}).transform((data) => ({
  ...data,
  imageUrl: data.imageUrl && data.imageUrl.trim() ? data.imageUrl : undefined,
  websiteUrl: data.websiteUrl && data.websiteUrl.trim() ? data.websiteUrl : null,
  ico: data.ico && data.ico.trim() ? data.ico : null,
}));

export type CreateOrganization = z.infer<typeof CreateOrganizationSchema>;

/**
 * Schéma pro aktualizaci organizace
 * Nemůžeme použít .partial() na schéma s .transform(), takže vytvoříme nové schéma
 */
export const UpdateOrganizationSchema = z.object({
  name: z.string().min(1).max(64).optional(),
  imageUrl: z.union([OrganizationImageSchema, z.literal("")]).optional(),
  websiteUrl: z.union([z.string().url().max(128), z.literal("")]).nullable().optional(),
  email: z.string().email().max(128).optional(),
  phone: z.string().max(128).optional(),
  location: z.string().max(128).optional(),
  ico: z.union([z.string().max(9), z.literal("")]).nullable().optional(),
  verified: z.boolean().optional(),
  maxStorageBytes: z.number().int().positive().optional(),
}).transform((data) => ({
  ...data,
  imageUrl: data.imageUrl && data.imageUrl.trim() ? data.imageUrl : undefined,
  websiteUrl: data.websiteUrl && data.websiteUrl.trim() ? data.websiteUrl : null,
  ico: data.ico && data.ico.trim() ? data.ico : null,
}));

export type UpdateOrganization = z.infer<typeof UpdateOrganizationSchema>;

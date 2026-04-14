import { z } from "zod";

const emptyStringToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    if (typeof value === "string" && value.trim() === "") {
      return undefined;
    }
    return value;
  }, schema);

/**
 * Schéma pro nastavení
 */
export const SettingsSchema = z.object({
  id: z.string().uuid(),
  name: z.string().max(64).nullable(),
  seoName: z.string().max(64).nullable(),
  seoAuthor: z.string().max(64).nullable(),
  seoUrl: z.string().url().max(128).nullable(),
  seoDescription: z.string().max(512).nullable(),
  seoImageUrl: z.string().url().max(1024).nullable(),
  seoHex: z.string().regex(/^[0-9A-Fa-f]{6}$/).nullable(),
  registrationEnabled: z.boolean(),
  plunkFromEmail: z.string().email().max(128).nullable(),
});

/**
 * Schéma pro aktualizaci nastavení
 */
export const UpdateSettingsSchema = z.object({
  name: emptyStringToUndefined(z.string().max(64).nullable()).optional(),
  seoName: emptyStringToUndefined(z.string().max(64).nullable()).optional(),
  seoAuthor: emptyStringToUndefined(z.string().max(64).nullable()).optional(),
  seoUrl: emptyStringToUndefined(z.string().url().max(128).nullable()).optional(),
  seoDescription: emptyStringToUndefined(z.string().max(512).nullable()).optional(),
  seoImageUrl: emptyStringToUndefined(z.string().url().max(1024).nullable()).optional(),
  seoHex: emptyStringToUndefined(
    z.string().regex(/^[0-9A-Fa-f]{6}$/).nullable(),
  ).optional(),
  registrationEnabled: z.boolean().optional(),
  plunkFromEmail: emptyStringToUndefined(
    z.string().email().max(128).nullable(),
  ).optional(),
  plunkApiKey: emptyStringToUndefined(z.string().min(1).max(512).nullable())
    .optional(),
});

export type UpdateSettings = z.infer<typeof UpdateSettingsSchema>;

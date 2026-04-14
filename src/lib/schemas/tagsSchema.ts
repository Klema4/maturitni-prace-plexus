import { z } from "zod";

/**
 * Schéma pro štítek
 */
export const TagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(32),
  description: z.string().max(128).nullable(),
});

/**
 * Schéma pro vytvoření štítku
 */
export const CreateTagSchema = z.object({
  name: z.string().min(1).max(32),
  description: z.string().max(128).optional().nullable(),
});

export type CreateTag = z.infer<typeof CreateTagSchema>;

/**
 * Schéma pro aktualizaci štítku
 */
export const UpdateTagSchema = CreateTagSchema.partial();

export type UpdateTag = z.infer<typeof UpdateTagSchema>;

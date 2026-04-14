import { z } from "zod";

/**
 * Schéma pro roli
 */
export const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(64),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).max(7),
  permissions: z.bigint(),
  weight: z.number().int(),
  createdAt: z.date(),
});

/**
 * Schéma pro vytvoření role
 */
export const CreateRoleSchema = z.object({
  name: z.string().min(1).max(64),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).max(7),
  permissions: z.union([
    z.string().transform((val) => BigInt(val)),
    z.bigint(),
  ]).optional(),
  weight: z.number().int().optional(),
});

export type CreateRole = z.infer<typeof CreateRoleSchema>;

/**
 * Schéma pro aktualizaci role
 */
export const UpdateRoleSchema = CreateRoleSchema.partial();

export type UpdateRole = z.infer<typeof UpdateRoleSchema>;

import {
  getAllRolesWithUserCount,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
} from "@/lib/repositories/rolesRepository";
import {
  CreateRoleSchema,
  UpdateRoleSchema,
} from "@/lib/schemas/rolesSchema";

/**
 * Získání všech rolí s počtem uživatelů
 */
export async function getAllRolesWithUserCountService() {
  return await getAllRolesWithUserCount();
}

/**
 * Získání role podle ID
 */
export async function getRoleByIdService(roleId: string) {
  return await getRoleById(roleId);
}

/**
 * Vytvoření nové role
 */
export async function createRoleService(data: unknown) {
  const validatedData = CreateRoleSchema.parse(data);
  return await createRole({
    name: validatedData.name,
    color: validatedData.color,
    permissions: validatedData.permissions || BigInt(0),
    weight: validatedData.weight || 0,
  });
}

/**
 * Aktualizace role
 */
export async function updateRoleService(roleId: string, data: unknown) {
  const validatedData = UpdateRoleSchema.parse(data);
  
  const updateData: {
    name?: string;
    color?: string;
    permissions?: bigint;
    weight?: number;
  } = {};

  if (validatedData.name !== undefined) {
    updateData.name = validatedData.name;
  }
  if (validatedData.color !== undefined) {
    updateData.color = validatedData.color;
  }
  if (validatedData.permissions !== undefined) {
    updateData.permissions = validatedData.permissions;
  }
  if (validatedData.weight !== undefined) {
    updateData.weight = validatedData.weight;
  }

  return await updateRole(roleId, updateData);
}

/**
 * Smazání role
 */
export async function deleteRoleService(roleId: string) {
  return await deleteRole(roleId);
}

import { db } from "@/lib/db";
import { roleDefinitions, userToRoles, users } from "@/lib/schema";
import { eq, and, isNull, desc, sql, inArray } from "drizzle-orm";

/**
 * Typ role s počtem uživatelů
 */
export type RoleWithUserCount = {
  id: string;
  name: string;
  color: string;
  permissions: bigint;
  weight: number;
  createdAt: Date;
  userCount: number;
};

/**
 * Získání všech rolí s počtem uživatelů
 */
export async function getAllRolesWithUserCount(): Promise<RoleWithUserCount[]> {
  const roles = await db
    .select({
      id: roleDefinitions.id,
      name: roleDefinitions.name,
      color: roleDefinitions.color,
      permissions: roleDefinitions.permissions,
      weight: roleDefinitions.weight,
      createdAt: roleDefinitions.createdAt,
    })
    .from(roleDefinitions)
    .orderBy(desc(roleDefinitions.weight), roleDefinitions.name);

  if (roles.length === 0) {
    return [];
  }

  const roleIds = roles.map((r) => r.id);

  // Získat počet uživatelů pro každou roli
  let userCounts: Array<{
    roleId: string;
    count: number;
  }> = [];

  if (roleIds.length > 0) {
    const whereCondition = roleIds.length === 1
      ? eq(userToRoles.roleId, roleIds[0])
      : inArray(userToRoles.roleId, roleIds);

    const counts = await db
      .select({
        roleId: userToRoles.roleId,
        count: sql<number>`COUNT(DISTINCT ${userToRoles.userId})`,
      })
      .from(userToRoles)
      .innerJoin(users, eq(userToRoles.userId, users.id))
      .where(and(whereCondition, isNull(users.deletedAt)))
      .groupBy(userToRoles.roleId);

    userCounts = counts.map((c) => ({
      roleId: c.roleId,
      count: Number(c.count) || 0,
    }));
  }

  const countsMap = new Map(userCounts.map((c) => [c.roleId, c.count]));

  return roles.map((role) => ({
    ...role,
    userCount: countsMap.get(role.id) || 0,
  }));
}

/**
 * Získání role podle ID
 */
export async function getRoleById(roleId: string) {
  const result = await db
    .select({
      id: roleDefinitions.id,
      name: roleDefinitions.name,
      color: roleDefinitions.color,
      permissions: roleDefinitions.permissions,
      weight: roleDefinitions.weight,
      createdAt: roleDefinitions.createdAt,
    })
    .from(roleDefinitions)
    .where(eq(roleDefinitions.id, roleId))
    .limit(1);

  return result[0] || null;
}

/**
 * Vytvoření nové role
 */
export async function createRole(data: {
  name: string;
  color: string;
  permissions?: bigint;
  weight?: number;
}) {
  const result = await db
    .insert(roleDefinitions)
    .values({
      name: data.name,
      color: data.color,
      permissions: data.permissions || BigInt(0),
      weight: data.weight || 0,
    })
    .returning({
      id: roleDefinitions.id,
      name: roleDefinitions.name,
      color: roleDefinitions.color,
      permissions: roleDefinitions.permissions,
      weight: roleDefinitions.weight,
      createdAt: roleDefinitions.createdAt,
    });

  return result[0];
}

/**
 * Aktualizace role
 */
export async function updateRole(
  roleId: string,
  data: {
    name?: string;
    color?: string;
    permissions?: bigint;
    weight?: number;
  }
) {
  const result = await db
    .update(roleDefinitions)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.color !== undefined && { color: data.color }),
      ...(data.permissions !== undefined && { permissions: data.permissions }),
      ...(data.weight !== undefined && { weight: data.weight }),
    })
    .where(eq(roleDefinitions.id, roleId))
    .returning({
      id: roleDefinitions.id,
      name: roleDefinitions.name,
      color: roleDefinitions.color,
      permissions: roleDefinitions.permissions,
      weight: roleDefinitions.weight,
      createdAt: roleDefinitions.createdAt,
    });

  return result[0] || null;
}

/**
 * Smazání role
 */
export async function deleteRole(roleId: string): Promise<boolean> {
  try {
    await db.delete(roleDefinitions).where(eq(roleDefinitions.id, roleId));
    return true;
  } catch (error) {
    console.error("Error deleting role:", error);
    return false;
  }
}

/**
 * Efektivní oprávnění uživatele (OR všech oprávnění jeho rolí).
 * @param userId - ID uživatele.
 * @returns {Promise<bigint>} Kombinovaná bitmask oprávnění ze všech rolí uživatele.
 */
export async function getEffectivePermissionsForUser(
  userId: string,
): Promise<bigint> {
  const rows = await db
    .select({ permissions: roleDefinitions.permissions })
    .from(userToRoles)
    .innerJoin(roleDefinitions, eq(userToRoles.roleId, roleDefinitions.id))
    .where(eq(userToRoles.userId, userId));

  let combined = BigInt(0);
  for (const row of rows) {
    combined |= row.permissions;
  }
  return combined;
}

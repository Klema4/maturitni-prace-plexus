import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { getEffectivePermissionsForUser } from "@/lib/repositories/rolesRepository";

export async function getHasDashboardAccess(userId: string) {
  const userPermissions = await getEffectivePermissionsForUser(userId);

  return hasPermission(userPermissions, PERMISSIONS.OVERVIEW_VIEW);
}

import { getEffectivePermissionsForUser } from "@/lib/repositories/rolesRepository";

export async function getDashboardUserPermissionsService(userId: string) {
  return getEffectivePermissionsForUser(userId);
}

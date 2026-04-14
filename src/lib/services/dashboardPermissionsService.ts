import {
  createRoleService,
  deleteRoleService,
  getAllRolesWithUserCountService,
  getRoleByIdService,
  updateRoleService,
} from "@/lib/services/rolesService";
import { getAllUsers } from "@/lib/repositories/userRepository";

function serializeRolePermissions<T extends { permissions: bigint }>(role: T) {
  return {
    ...role,
    permissions: role.permissions.toString(),
  };
}

export async function getDashboardPermissionsService(input: {
  roleId?: string | null;
  users?: boolean;
}) {
  if (input.roleId) {
    const role = await getRoleByIdService(input.roleId);
    return { role: role ? serializeRolePermissions(role) : null };
  }

  if (input.users) {
    return { users: await getAllUsers(1000, 0) };
  }

  const roles = await getAllRolesWithUserCountService();
  return { roles: roles.map(serializeRolePermissions) };
}

export async function createDashboardRoleService(data: unknown) {
  const role = await createRoleService(data);
  return serializeRolePermissions(role);
}

export async function updateDashboardRoleService(id: string, data: unknown) {
  const role = await updateRoleService(id, data);
  return role ? serializeRolePermissions(role) : null;
}

export async function deleteDashboardRoleService(id: string) {
  return deleteRoleService(id);
}

import {
  addRoleToUser,
  getAllRoles,
  getAllUsers,
  getRedactionMembers,
  getUserStats,
  removeRoleFromUser,
  searchUsers,
  toggleUserBan,
  updateUserBasicInfo,
  updateUserMaxStorageBytes,
} from "@/lib/repositories/userRepository";

export async function listDashboardUsersService(input: {
  query?: string | null;
  limit: number;
  offset: number;
  stats?: boolean;
}) {
  if (input.stats) {
    return { stats: await getUserStats() };
  }

  const users = input.query
    ? await searchUsers(input.query, input.limit, input.offset)
    : await getAllUsers(input.limit, input.offset);

  return { users };
}

export async function updateDashboardUserRoleService(input: {
  userId: string;
  roleId: string;
  add: boolean;
}) {
  return input.add
    ? addRoleToUser(input.userId, input.roleId)
    : removeRoleFromUser(input.userId, input.roleId);
}

export async function toggleDashboardUserBanService(input: {
  userId: string;
  ban: boolean;
}) {
  return toggleUserBan(input.userId, input.ban);
}

export async function updateDashboardUserQuotaService(input: {
  userId: string;
  maxStorageBytes: number;
}) {
  return updateUserMaxStorageBytes(input.userId, input.maxStorageBytes);
}

export async function updateDashboardUserInfoService(input: {
  userId: string;
  name: string;
  surname: string;
  email: string;
}) {
  return updateUserBasicInfo(input.userId, {
    name: input.name,
    surname: input.surname,
    email: input.email,
  });
}

export async function listDashboardUserRolesService() {
  const roles = await getAllRoles();
  return { roles: roles.map((role) => ({ id: role.id, name: role.name, color: role.color })) };
}

export async function listDashboardRedactionMembersService(input: {
  rolesOnly?: boolean;
}) {
  if (input.rolesOnly) {
    return { roles: await getAllRoles() };
  }

  return { members: await getRedactionMembers() };
}

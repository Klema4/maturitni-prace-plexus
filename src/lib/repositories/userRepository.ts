import { db } from "@/lib/db";
import { users, userToRoles, roleDefinitions, articles } from "@/lib/schema";
import { eq, and, isNull, desc, sql, like, or, inArray } from "drizzle-orm";

/**
 * Typ uživatele s kompletními daty
 */
export type UserData = {
  id: string;
  name: string;
  surname: string;
  email: string;
  image: string | null;
  createdAt: Date;
  isBanned: boolean;
  maxStorageBytes: number;
};

/**
 * Typ uživatele s rolemi pro dashboard
 */
export type UserWithRoles = UserData & {
  roles: {
    id: string;
    name: string;
    color: string;
    weight: number;
  }[];
};

/**
 * Aktualizace základních informací o uživateli
 */
export async function updateUserBasicInfo(
  userId: string,
  data: {
    name: string;
    surname: string;
    email: string;
  },
): Promise<boolean> {
  try {
    await db
      .update(users)
      .set({
        name: data.name,
        surname: data.surname,
        email: data.email,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("Error updating user basic info:", error);
    return false;
  }
}

/**
 * Získání uživatele podle ID
 */
export async function getUserById(userId: string): Promise<UserData | null> {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      surname: users.surname,
      email: users.email,
      image: users.image,
      createdAt: users.createdAt,
      isBanned: users.isBanned,
      maxStorageBytes: users.maxStorageBytes,
    })
    .from(users)
    .where(
      and(
        eq(users.id, userId),
        isNull(users.deletedAt)
      )
    )
    .limit(1);

  return result[0] || null;
}

/**
 * Získání všech uživatelů pro dashboard
 */
export async function getAllUsers(
  limit: number = 50,
  offset: number = 0
): Promise<UserWithRoles[]> {
  const usersResult = await db
    .select({
      id: users.id,
      name: users.name,
      surname: users.surname,
      email: users.email,
      image: users.image,
      createdAt: users.createdAt,
      isBanned: users.isBanned,
      maxStorageBytes: users.maxStorageBytes,
    })
    .from(users)
    .where(isNull(users.deletedAt))
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  if (usersResult.length === 0) {
    return [];
  }

  const userIds = usersResult.map((u) => u.id);

  // Získat role pro všechny uživatele
  let rolesResult: Array<{
    userId: string;
    role: {
      id: string;
      name: string;
      color: string;
      weight: number;
    };
  }> = [];

  if (userIds.length > 0) {
    // Použít inArray pouze pokud je více než jeden prvek, jinak použít eq
    const whereCondition = userIds.length === 1
      ? eq(userToRoles.userId, userIds[0])
      : inArray(userToRoles.userId, userIds);

    rolesResult = await db
      .select({
        userId: userToRoles.userId,
        role: {
          id: roleDefinitions.id,
          name: roleDefinitions.name,
          color: roleDefinitions.color,
          weight: roleDefinitions.weight,
        },
      })
      .from(userToRoles)
      .innerJoin(roleDefinitions, eq(userToRoles.roleId, roleDefinitions.id))
      .where(whereCondition);
  }

  // Seskupit role podle userId
  const rolesByUserId = new Map<
    string,
    { id: string; name: string; color: string; weight: number }[]
  >();
  for (const row of rolesResult) {
    if (!rolesByUserId.has(row.userId)) {
      rolesByUserId.set(row.userId, []);
    }
    rolesByUserId.get(row.userId)!.push(row.role);
  }

  return usersResult.map((user) => ({
    ...user,
    roles: rolesByUserId.get(user.id) || [],
  }));
}

/**
 * Vyhledávání uživatelů
 */
export async function searchUsers(
  query: string,
  limit: number = 50,
  offset: number = 0
): Promise<UserWithRoles[]> {
  const searchPattern = `%${query}%`;

  const usersResult = await db
    .select({
      id: users.id,
      name: users.name,
      surname: users.surname,
      email: users.email,
      image: users.image,
      createdAt: users.createdAt,
      isBanned: users.isBanned,
      maxStorageBytes: users.maxStorageBytes,
    })
    .from(users)
    .where(
      and(
        isNull(users.deletedAt),
        or(
          like(users.name, searchPattern),
          like(users.surname, searchPattern),
          like(users.email, searchPattern)
        )
      )
    )
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .offset(offset);

  if (usersResult.length === 0) {
    return [];
  }

  const userIds = usersResult.map((u) => u.id);

  let rolesResult: Array<{
    userId: string;
    role: {
      id: string;
      name: string;
      color: string;
      weight: number;
    };
  }> = [];

  if (userIds.length > 0) {
    // Použít inArray pouze pokud je více než jeden prvek, jinak použít eq
    const whereCondition = userIds.length === 1
      ? eq(userToRoles.userId, userIds[0])
      : inArray(userToRoles.userId, userIds);

    rolesResult = await db
      .select({
        userId: userToRoles.userId,
        role: {
          id: roleDefinitions.id,
          name: roleDefinitions.name,
          color: roleDefinitions.color,
          weight: roleDefinitions.weight,
        },
      })
      .from(userToRoles)
      .innerJoin(roleDefinitions, eq(userToRoles.roleId, roleDefinitions.id))
      .where(whereCondition);
  }

  const rolesByUserId = new Map<
    string,
    { id: string; name: string; color: string; weight: number }[]
  >();
  for (const row of rolesResult) {
    if (!rolesByUserId.has(row.userId)) {
      rolesByUserId.set(row.userId, []);
    }
    rolesByUserId.get(row.userId)!.push(row.role);
  }

  return usersResult.map((user) => ({
    ...user,
    roles: rolesByUserId.get(user.id) || [],
  }));
}

/**
 * Získání statistik uživatelů
 */
export async function getUserStats() {
  const [total, banned, verified] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)` }).from(users).where(isNull(users.deletedAt)),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(and(eq(users.isBanned, true), isNull(users.deletedAt))),
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(users)
      .where(and(eq(users.emailVerified, true), isNull(users.deletedAt))),
  ]);

  return {
    total: Number(total[0]?.count) || 0,
    banned: Number(banned[0]?.count) || 0,
    verified: Number(verified[0]?.count) || 0,
  };
}

/**
 * Typ člena redakce s rolemi a statistikami
 */
export type RedactionMember = UserWithRoles & {
  articlesCount: number;
  primaryRole: {
    id: string;
    name: string;
    color: string;
  } | null;
};

/**
 * Získání členů redakce (uživatelé s alespoň jednou rolí)
 */
export async function getRedactionMembers(): Promise<RedactionMember[]> {
  // Získat všechny uživatele s rolemi
  const usersWithRoles = await db
    .select({
      id: users.id,
      name: users.name,
      surname: users.surname,
      email: users.email,
      image: users.image,
      createdAt: users.createdAt,
      isBanned: users.isBanned,
      maxStorageBytes: users.maxStorageBytes,
      roleId: roleDefinitions.id,
      roleName: roleDefinitions.name,
      roleColor: roleDefinitions.color,
      weight: roleDefinitions.weight,
    })
    .from(users)
    .innerJoin(userToRoles, eq(users.id, userToRoles.userId))
    .innerJoin(roleDefinitions, eq(userToRoles.roleId, roleDefinitions.id))
    .where(isNull(users.deletedAt))
    .orderBy(desc(roleDefinitions.weight), roleDefinitions.name);

  if (usersWithRoles.length === 0) {
    return [];
  }

  // Seskupit podle uživatele
  const usersMap = new Map<string, RedactionMember>();

  for (const row of usersWithRoles) {
    if (!usersMap.has(row.id)) {
      usersMap.set(row.id, {
        id: row.id,
        name: row.name,
        surname: row.surname,
        email: row.email,
        image: row.image,
        createdAt: row.createdAt,
        isBanned: row.isBanned,
        maxStorageBytes: row.maxStorageBytes,
        roles: [],
        articlesCount: 0,
        primaryRole: null,
      });
    }

    const user = usersMap.get(row.id)!;
    const role = {
      id: row.roleId,
      name: row.roleName,
      color: row.roleColor,
      weight: row.weight,
    };

    // Přidat roli, pokud ještě není v seznamu
    if (!user.roles.find((r) => r.id === role.id)) {
      user.roles.push(role);
    }

    // Nastavit primární roli (první role podle váhy)
    if (!user.primaryRole) {
      user.primaryRole = role;
    }
  }

  // Získat počet článků pro každého uživatele
  const userIds = Array.from(usersMap.keys());
  if (userIds.length > 0) {
    const whereCondition = userIds.length === 1
      ? eq(articles.authorId, userIds[0])
      : inArray(articles.authorId, userIds);

    const articlesCounts = await db
      .select({
        authorId: articles.authorId,
        count: sql<number>`COUNT(*)`,
      })
      .from(articles)
      .where(and(whereCondition, isNull(articles.deletedAt)))
      .groupBy(articles.authorId);

    for (const countRow of articlesCounts) {
      if (countRow.authorId) {
        const user = usersMap.get(countRow.authorId);
        if (user) {
          user.articlesCount = Number(countRow.count) || 0;
        }
      }
    }
  }

  return Array.from(usersMap.values());
}

/**
 * Přidání role uživateli
 */
export async function addRoleToUser(userId: string, roleId: string): Promise<boolean> {
  try {
    await db.insert(userToRoles).values({
      userId,
      roleId,
    });
    return true;
  } catch (error) {
    console.error("Error adding role to user:", error);
    return false;
  }
}

/**
 * Odebrání role uživateli
 */
export async function removeRoleFromUser(userId: string, roleId: string): Promise<boolean> {
  try {
    await db
      .delete(userToRoles)
      .where(and(eq(userToRoles.userId, userId), eq(userToRoles.roleId, roleId)));
    return true;
  } catch (error) {
    console.error("Error removing role from user:", error);
    return false;
  }
}

/**
 * Získání všech rolí
 */
export async function getAllRoles() {
  return await db
    .select({
      id: roleDefinitions.id,
      name: roleDefinitions.name,
      color: roleDefinitions.color,
      weight: roleDefinitions.weight,
    })
    .from(roleDefinitions)
    .orderBy(desc(roleDefinitions.weight), roleDefinitions.name);
}

/**
 * Zabanování nebo odzabanování uživatele
 */
export async function toggleUserBan(userId: string, ban: boolean): Promise<boolean> {
  try {
    await db
      .update(users)
      .set({
        isBanned: ban,
        bannedAt: ban ? new Date() : null,
      })
      .where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("Error toggling user ban:", error);
    return false;
  }
}

/**
 * Aktualizace storage kvóty uživatele
 */
export async function updateUserMaxStorageBytes(
  userId: string,
  maxStorageBytes: number,
): Promise<boolean> {
  try {
    await db
      .update(users)
      .set({
        maxStorageBytes,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error("Error updating user storage quota:", error);
    return false;
  }
}

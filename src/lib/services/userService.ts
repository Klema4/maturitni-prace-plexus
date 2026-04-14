import { getUserById, type UserData } from "@/lib/repositories/userRepository";

/**
 * Získání aktuálního přihlášeného uživatele
 */
export async function getCurrentUser(userId: string): Promise<UserData | null> {
  return await getUserById(userId);
}

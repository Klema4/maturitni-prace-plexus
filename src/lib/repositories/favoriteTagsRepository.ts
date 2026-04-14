import { db } from "@/lib/db";
import { favoriteTags, tags } from "@/lib/schema";
import { eq, and, inArray } from "drizzle-orm";
import type { Tag } from "./tagsRepository";

/**
 * Získání všech oblíbených tagů uživatele
 */
export async function getUserFavoriteTags(userId: string): Promise<Tag[]> {
  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
      description: tags.description,
    })
    .from(favoriteTags)
    .innerJoin(tags, eq(favoriteTags.tagId, tags.id))
    .where(eq(favoriteTags.userId, userId))
    .orderBy(tags.name);

  return result;
}

/**
 * Přidání oblíbeného tagu uživateli
 */
export async function addFavoriteTag(userId: string, tagId: string): Promise<boolean> {
  try {
    await db.insert(favoriteTags).values({
      userId,
      tagId,
    });
    return true;
  } catch (error) {
    console.error("Error adding favorite tag:", error);
    return false;
  }
}

/**
 * Odebrání oblíbeného tagu uživateli
 */
export async function removeFavoriteTag(userId: string, tagId: string): Promise<boolean> {
  try {
    await db
      .delete(favoriteTags)
      .where(
        and(
          eq(favoriteTags.userId, userId),
          eq(favoriteTags.tagId, tagId)
        )
      );
    return true;
  } catch (error) {
    console.error("Error removing favorite tag:", error);
    return false;
  }
}

/**
 * Kontrola, zda má uživatel tag v oblíbených
 */
export async function isFavoriteTag(userId: string, tagId: string): Promise<boolean> {
  const result = await db
    .select()
    .from(favoriteTags)
    .where(
      and(
        eq(favoriteTags.userId, userId),
        eq(favoriteTags.tagId, tagId)
      )
    )
    .limit(1);

  return result.length > 0;
}

/**
 * Získání ID oblíbených tagů uživatele
 */
export async function getUserFavoriteTagIds(userId: string): Promise<string[]> {
  const result = await db
    .select({ tagId: favoriteTags.tagId })
    .from(favoriteTags)
    .where(eq(favoriteTags.userId, userId));

  return result.map((r) => r.tagId);
}

import { db } from "@/lib/db";
import { tags, articleTags, sectionTags } from "@/lib/schema";
import { eq, isNull, sql, desc } from "drizzle-orm";
import { normalizeSlug } from "@/lib/utils/slug";

/**
 * Typ štítku
 */
export type Tag = {
  id: string;
  name: string;
  description: string | null;
};

/**
 * Typ štítku s počtem použití
 */
export type TagWithUsage = Tag & {
  articleCount: number;
  sectionCount: number;
};

/**
 * Získání všech štítků
 */
export async function getAllTags(): Promise<Tag[]> {
  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
      description: tags.description,
    })
    .from(tags)
    .orderBy(tags.name);

  return result;
}

/**
 * Získání štítku podle ID
 */
export async function getTagById(tagId: string): Promise<Tag | null> {
  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
      description: tags.description,
    })
    .from(tags)
    .where(eq(tags.id, tagId))
    .limit(1);

  return result[0] || null;
}

/**
 * Získání štítku podle názvu
 */
export async function getTagByName(name: string): Promise<Tag | null> {
  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
      description: tags.description,
    })
    .from(tags)
    .where(sql`LOWER(${tags.name}) = LOWER(${name})`)
    .limit(1);

  return result[0] || null;
}

/**
 * Získání štítku podle slugu (normalizovaný název).
 */
export async function getTagBySlug(tagSlug: string): Promise<Tag | null> {
  const normalizedSlug = normalizeSlug(tagSlug);
  if (!normalizedSlug) {
    return null;
  }

  const tagName = tagSlug.replace(/-/g, " ").trim();
  const exact = tagName ? await getTagByName(tagName) : null;
  if (exact) {
    return exact;
  }

  const all = await getAllTags();
  return all.find((t) => normalizeSlug(t.name) === normalizedSlug) ?? null;
}

/**
 * Získání štítků s počtem použití
 */
export async function getTagsWithUsage(): Promise<TagWithUsage[]> {
  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
      description: tags.description,
      articleCount: sql<number>`COUNT(DISTINCT ${articleTags.articleId})`.as("article_count"),
      sectionCount: sql<number>`COUNT(DISTINCT ${sectionTags.sectionId})`.as("section_count"),
    })
    .from(tags)
    .leftJoin(articleTags, eq(tags.id, articleTags.tagId))
    .leftJoin(sectionTags, eq(tags.id, sectionTags.tagId))
    .groupBy(tags.id, tags.name, tags.description)
    .orderBy(desc(sql`COUNT(DISTINCT ${articleTags.articleId})`));

  return result.map((tag) => ({
    id: tag.id,
    name: tag.name,
    description: tag.description,
    articleCount: Number(tag.articleCount) || 0,
    sectionCount: Number(tag.sectionCount) || 0,
  }));
}

/**
 * Vytvoření nového štítku
 */
export async function createTag(data: {
  name: string;
  description?: string | null;
}): Promise<Tag> {
  const result = await db
    .insert(tags)
    .values({
      name: data.name,
      description: data.description || null,
    })
    .returning({
      id: tags.id,
      name: tags.name,
      description: tags.description,
    });

  return result[0];
}

/**
 * Aktualizace štítku
 */
export async function updateTag(
  tagId: string,
  data: {
    name?: string;
    description?: string | null;
  }
): Promise<Tag | null> {
  const result = await db
    .update(tags)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
    })
    .where(eq(tags.id, tagId))
    .returning({
      id: tags.id,
      name: tags.name,
      description: tags.description,
    });

  return result[0] || null;
}

/**
 * Smazání štítku
 */
export async function deleteTag(tagId: string): Promise<boolean> {
  try {
    await db.delete(tags).where(eq(tags.id, tagId));
    return true;
  } catch (error) {
    console.error("Error deleting tag:", error);
    return false;
  }
}

/**
 * Získání štítků podle ID
 */
export async function getTagsByIds(tagIds: string[]): Promise<Tag[]> {
  if (tagIds.length === 0) {
    return [];
  }

  const result = await db
    .select({
      id: tags.id,
      name: tags.name,
      description: tags.description,
    })
    .from(tags)
    .where(sql`${tags.id} = ANY(${tagIds})`);

  return result;
}

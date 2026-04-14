import { unstable_cache } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { sections } from "@/lib/schema";

export type Section = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  isPrimary: boolean;
};

/**
 * Získání všech sekcí (nekešovaná verze)
 */
async function fetchAllSections(): Promise<Section[]> {
  const result = await db
    .select({
      id: sections.id,
      name: sections.name,
      slug: sections.slug,
      description: sections.description,
      isPrimary: sections.isPrimary,
    })
    .from(sections);

  return result;
}

/**
 * Získání primárních sekcí (nekešovaná verze)
 */
async function fetchPrimarySections(): Promise<Section[]> {
  const result = await db
    .select({
      id: sections.id,
      name: sections.name,
      slug: sections.slug,
      description: sections.description,
      isPrimary: sections.isPrimary,
    })
    .from(sections)
    .where(eq(sections.isPrimary, true));

  return result;
}

/**
 * Získání sekce podle slugu z databáze.
 */
export async function getSectionBySlug(slug: string): Promise<Section | null> {
  if (slug == null || typeof slug !== "string") return null;
  const exactSlug = slug.trim();

  const result = await db
    .select({
      id: sections.id,
      name: sections.name,
      slug: sections.slug,
      description: sections.description,
      isPrimary: sections.isPrimary,
    })
    .from(sections)
    .where(eq(sections.slug, exactSlug))
    .limit(1);

  if (result[0]) return result[0];
  return null;
}

/**
 * Kešované získání všech sekcí
 * Revaliduje se každých 5 minut (300 sekund)
 */
export const getAllSections = unstable_cache(
  fetchAllSections,
  ["all-sections"],
  { revalidate: 300, tags: ["sections"] },
);

/**
 * Kešované získání primárních sekcí (pro navbar)
 * Revaliduje se každých 5 minut (300 sekund)
 */
export const getPrimarySections = unstable_cache(
  fetchPrimarySections,
  ["primary-sections"],
  { revalidate: 300, tags: ["sections"] },
);

/**
 * Pro navbar - vrátí sekce jako navigační linky.
 * Používá výhradně slug uložený v databázi.
 */
export async function getNavSections(): Promise<
  { href: string; label: string }[]
> {
  const sectionsList = await getPrimarySections();

  return sectionsList.flatMap((section) => {
    if (!section.slug) return [];
    return {
      href: `/articles/${section.slug}`,
      label: section.name,
    };
  });
}

/**
 * Pro footer - vrátí všechny sekce jako navigační linky.
 * Používá výhradně slug uložený v databázi.
 */
export async function getFooterSections(): Promise<
  { href: string; label: string }[]
> {
  const sectionsList = await getAllSections();

  return sectionsList.flatMap((section) => {
    if (!section.slug) return [];
    return {
      href: `/articles/${section.slug}`,
      label: section.name,
    };
  });
}

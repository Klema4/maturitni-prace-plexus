import { db } from "@/lib/db";
import { getAllSections } from "@/lib/repositories/sectionsRepository";
import { sectionTags, sections, tags } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const DashboardSectionPayloadSchema = z.object({
  name: z.string().min(1).max(128),
  description: z.string().max(512).nullable().optional(),
  isPrimary: z.boolean().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
});

export async function listDashboardSectionsService() {
  const sectionsList = await getAllSections();
  const sectionTagRows = await db
    .select({
      sectionId: sectionTags.sectionId,
      tag: {
        id: tags.id,
        name: tags.name,
        description: tags.description,
      },
    })
    .from(sectionTags)
    .innerJoin(tags, eq(sectionTags.tagId, tags.id));

  const tagsBySection = new Map<
    string,
    Array<{ id: string; name: string; description: string | null }>
  >();

  for (const row of sectionTagRows) {
    const list = tagsBySection.get(row.sectionId) || [];
    list.push(row.tag);
    tagsBySection.set(row.sectionId, list);
  }

  return {
    sections: sectionsList.map((section) => ({
      ...section,
      tags: tagsBySection.get(section.id) || [],
    })),
  };
}

export async function createDashboardSectionService(data: unknown) {
  const payload = DashboardSectionPayloadSchema.parse(data);
  const result = await db
    .insert(sections)
    .values({
      name: payload.name,
      description: payload.description ?? null,
      isPrimary: payload.isPrimary ?? false,
    })
    .returning({
      id: sections.id,
      name: sections.name,
      description: sections.description,
      isPrimary: sections.isPrimary,
    });

  const section = result[0];
  if (!section) {
    throw new Error("Nepodařilo se vytvořit sekci");
  }

  const uniqueTagIds = Array.from(new Set(payload.tagIds || []));
  if (uniqueTagIds.length > 0) {
    await db.insert(sectionTags).values(
      uniqueTagIds.map((tagId) => ({
        sectionId: section.id,
        tagId,
      })),
    );
  }

  return { ...section, tags: [] };
}

export async function updateDashboardSectionService(
  sectionId: string,
  data: unknown,
) {
  const payload = DashboardSectionPayloadSchema.partial().parse(data);
  const result = await db
    .update(sections)
    .set({
      ...(payload.name !== undefined && { name: payload.name }),
      ...(payload.description !== undefined && {
        description: payload.description,
      }),
      ...(payload.isPrimary !== undefined && { isPrimary: payload.isPrimary }),
    })
    .where(eq(sections.id, sectionId))
    .returning({
      id: sections.id,
      name: sections.name,
      description: sections.description,
      isPrimary: sections.isPrimary,
    });

  const section = result[0];
  if (!section) {
    return null;
  }

  if (payload.tagIds !== undefined) {
    await db.delete(sectionTags).where(eq(sectionTags.sectionId, sectionId));
    const uniqueTagIds = Array.from(new Set(payload.tagIds));
    if (uniqueTagIds.length > 0) {
      await db.insert(sectionTags).values(
        uniqueTagIds.map((tagId) => ({
          sectionId,
          tagId,
        })),
      );
    }
  }

  return { ...section, tags: [] };
}

export async function deleteDashboardSectionService(sectionId: string) {
  await db.delete(sections).where(eq(sections.id, sectionId));
  return true;
}

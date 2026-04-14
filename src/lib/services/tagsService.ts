import {
  getAllTags,
  getTagById,
  getTagByName,
  createTag,
  updateTag,
  deleteTag,
  getTagsWithUsage,
} from "@/lib/repositories/tagsRepository";
import { CreateTagSchema, UpdateTagSchema } from "@/lib/schemas/tagsSchema";

/**
 * Získání všech štítků
 */
export async function getAllTagsService() {
  return await getAllTags();
}

/**
 * Získání štítků s počtem použití
 */
export async function getTagsWithUsageService() {
  return await getTagsWithUsage();
}

/**
 * Získání štítku podle ID
 */
export async function getTagByIdService(tagId: string) {
  return await getTagById(tagId);
}

/**
 * Vytvoření nového štítku
 */
export async function createTagService(data: unknown) {
  const validatedData = CreateTagSchema.parse(data);
  
  // Kontrola, zda štítek s tímto názvem už neexistuje
  const existing = await getTagByName(validatedData.name);
  if (existing) {
    throw new Error("Štítek s tímto názvem již existuje");
  }

  return await createTag(validatedData);
}

/**
 * Aktualizace štítku
 */
export async function updateTagService(tagId: string, data: unknown) {
  const validatedData = UpdateTagSchema.parse(data);

  // Pokud se mění název, kontrola duplicity
  if (validatedData.name) {
    const existing = await getTagByName(validatedData.name);
    if (existing && existing.id !== tagId) {
      throw new Error("Štítek s tímto názvem již existuje");
    }
  }

  return await updateTag(tagId, validatedData);
}

/**
 * Smazání štítku
 */
export async function deleteTagService(tagId: string) {
  return await deleteTag(tagId);
}

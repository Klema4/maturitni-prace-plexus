import { z } from "zod";

/**
 * Schéma pro složku
 */
export const FolderSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(64),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

/**
 * Schéma pro vytvoření složky
 */
export const CreateFolderSchema = z.object({
  name: z.string().min(1).max(64),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export type CreateFolder = z.infer<typeof CreateFolderSchema>;

/**
 * Schéma pro aktualizaci složky
 */
export const UpdateFolderSchema = CreateFolderSchema.partial();

export type UpdateFolder = z.infer<typeof UpdateFolderSchema>;

/**
 * Schéma pro soubor v úložišti
 */
export const StorageFileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().nullable(),
  folderId: z.string().uuid().nullable(),
  fileUrl: z.string().url().max(1024),
  fileName: z.string().min(1).max(256),
  fileSize: z.number().int().positive(),
  uploadedAt: z.date(),
  deletedAt: z.date().nullable(),
});

/**
 * Schéma pro vytvoření souboru
 */
export const CreateStorageFileSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  folderId: z.string().uuid().optional().nullable(),
  fileUrl: z.string().url().max(1024),
  fileName: z.string().min(1).max(256),
  fileSize: z.number().int().positive(),
});

export type CreateStorageFile = z.infer<typeof CreateStorageFileSchema>;

/**
 * Schéma pro aktualizaci souboru
 */
export const UpdateStorageFileSchema = z.object({
  folderId: z.string().uuid().optional().nullable(),
  fileName: z.string().min(1).max(256).optional(),
});

export type UpdateStorageFile = z.infer<typeof UpdateStorageFileSchema>;

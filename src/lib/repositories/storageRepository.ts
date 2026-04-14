import { db } from "@/lib/db";
import { storage, folders, users } from "@/lib/schema";
import { eq, and, isNull, desc, sql } from "drizzle-orm";

/**
 * Typ souboru v úložišti
 */
export type StorageFile = {
  id: string;
  userId: string | null;
  folderId: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  deletedAt: Date | null;
};

/**
 * Typ souboru s uživatelem a složkou
 */
export type StorageFileWithRelations = StorageFile & {
  user: {
    id: string;
    name: string;
    surname: string;
    image: string | null;
  } | null;
  folder: {
    id: string;
    name: string;
    color: string;
  } | null;
};

/**
 * Typ složky
 */
export type Folder = {
  id: string;
  name: string;
  color: string;
};

/**
 * Získání všech složek
 */
export async function getAllFolders(): Promise<Folder[]> {
  const result = await db
    .select({
      id: folders.id,
      name: folders.name,
      color: folders.color,
    })
    .from(folders)
    .orderBy(folders.name);

  return result;
}

/**
 * Získání složky podle ID
 */
export async function getFolderById(folderId: string): Promise<Folder | null> {
  const result = await db
    .select({
      id: folders.id,
      name: folders.name,
      color: folders.color,
    })
    .from(folders)
    .where(eq(folders.id, folderId))
    .limit(1);

  return result[0] || null;
}

/**
 * Vytvoření nové složky
 */
export async function createFolder(data: {
  name: string;
  color?: string;
}): Promise<Folder> {
  const result = await db
    .insert(folders)
    .values({
      name: data.name,
      color: data.color || "#FFFFFF",
    })
    .returning({
      id: folders.id,
      name: folders.name,
      color: folders.color,
    });

  return result[0];
}

/**
 * Aktualizace složky
 */
export async function updateFolder(
  folderId: string,
  data: {
    name?: string;
    color?: string;
  }
): Promise<Folder | null> {
  const result = await db
    .update(folders)
    .set({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.color !== undefined && { color: data.color }),
    })
    .where(eq(folders.id, folderId))
    .returning({
      id: folders.id,
      name: folders.name,
      color: folders.color,
    });

  return result[0] || null;
}

/**
 * Smazání složky
 */
export async function deleteFolder(folderId: string): Promise<boolean> {
  try {
    await db.delete(folders).where(eq(folders.id, folderId));
    return true;
  } catch (error) {
    console.error("Error deleting folder:", error);
    return false;
  }
}

/**
 * Získání všech souborů
 */
export async function getAllFiles(): Promise<StorageFileWithRelations[]> {
  const result = await db
    .select({
      id: storage.id,
      userId: storage.userId,
      folderId: storage.folderId,
      fileUrl: storage.fileUrl,
      fileName: storage.fileName,
      fileSize: storage.fileSize,
      uploadedAt: storage.uploadedAt,
      deletedAt: storage.deletedAt,
      user: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        image: users.image,
      },
      folder: {
        id: folders.id,
        name: folders.name,
        color: folders.color,
      },
    })
    .from(storage)
    .leftJoin(users, eq(storage.userId, users.id))
    .leftJoin(folders, eq(storage.folderId, folders.id))
    .where(isNull(storage.deletedAt))
    .orderBy(desc(storage.uploadedAt));

  return result.map((file) => ({
    id: file.id,
    userId: file.userId,
    folderId: file.folderId,
    fileUrl: file.fileUrl,
    fileName: file.fileName,
    fileSize: file.fileSize,
    uploadedAt: file.uploadedAt,
    deletedAt: file.deletedAt,
    user: file.user?.id ? {
      id: file.user.id,
      name: file.user.name,
      surname: file.user.surname,
      image: file.user.image,
    } : null,
    folder: file.folder?.id ? {
      id: file.folder.id,
      name: file.folder.name,
      color: file.folder.color,
    } : null,
  }));
}

/**
 * Získání souborů podle složky
 */
export async function getFilesByFolderId(
  folderId: string
): Promise<StorageFileWithRelations[]> {
  const result = await db
    .select({
      id: storage.id,
      userId: storage.userId,
      folderId: storage.folderId,
      fileUrl: storage.fileUrl,
      fileName: storage.fileName,
      fileSize: storage.fileSize,
      uploadedAt: storage.uploadedAt,
      deletedAt: storage.deletedAt,
      user: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        image: users.image,
      },
      folder: {
        id: folders.id,
        name: folders.name,
        color: folders.color,
      },
    })
    .from(storage)
    .leftJoin(users, eq(storage.userId, users.id))
    .leftJoin(folders, eq(storage.folderId, folders.id))
    .where(
      and(
        eq(storage.folderId, folderId),
        isNull(storage.deletedAt)
      )
    )
    .orderBy(desc(storage.uploadedAt));

  return result.map((file) => ({
    id: file.id,
    userId: file.userId,
    folderId: file.folderId,
    fileUrl: file.fileUrl,
    fileName: file.fileName,
    fileSize: file.fileSize,
    uploadedAt: file.uploadedAt,
    deletedAt: file.deletedAt,
    user: file.user?.id ? {
      id: file.user.id,
      name: file.user.name,
      surname: file.user.surname,
      image: file.user.image,
    } : null,
    folder: file.folder?.id ? {
      id: file.folder.id,
      name: file.folder.name,
      color: file.folder.color,
    } : null,
  }));
}

/**
 * Získání souboru podle ID
 */
export async function getFileById(
  fileId: string
): Promise<StorageFileWithRelations | null> {
  const result = await db
    .select({
      id: storage.id,
      userId: storage.userId,
      folderId: storage.folderId,
      fileUrl: storage.fileUrl,
      fileName: storage.fileName,
      fileSize: storage.fileSize,
      uploadedAt: storage.uploadedAt,
      deletedAt: storage.deletedAt,
      user: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        image: users.image,
      },
      folder: {
        id: folders.id,
        name: folders.name,
        color: folders.color,
      },
    })
    .from(storage)
    .leftJoin(users, eq(storage.userId, users.id))
    .leftJoin(folders, eq(storage.folderId, folders.id))
    .where(
      and(
        eq(storage.id, fileId),
        isNull(storage.deletedAt)
      )
    )
    .limit(1);

  if (!result[0]) return null;

  const file = result[0];
  return {
    id: file.id,
    userId: file.userId,
    folderId: file.folderId,
    fileUrl: file.fileUrl,
    fileName: file.fileName,
    fileSize: file.fileSize,
    uploadedAt: file.uploadedAt,
    deletedAt: file.deletedAt,
    user: file.user?.id ? {
      id: file.user.id,
      name: file.user.name,
      surname: file.user.surname,
      image: file.user.image,
    } : null,
    folder: file.folder?.id ? {
      id: file.folder.id,
      name: file.folder.name,
      color: file.folder.color,
    } : null,
  };
}

/**
 * Vytvoření nového souboru
 */
export async function createFile(data: {
  userId?: string | null;
  folderId?: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
}): Promise<StorageFile> {
  const result = await db
    .insert(storage)
    .values({
      userId: data.userId || null,
      folderId: data.folderId || null,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
    })
    .returning({
      id: storage.id,
      userId: storage.userId,
      folderId: storage.folderId,
      fileUrl: storage.fileUrl,
      fileName: storage.fileName,
      fileSize: storage.fileSize,
      uploadedAt: storage.uploadedAt,
      deletedAt: storage.deletedAt,
    });

  return result[0];
}

/**
 * Aktualizace souboru
 */
export async function updateFile(
  fileId: string,
  data: {
    folderId?: string | null;
    fileName?: string;
  }
): Promise<StorageFile | null> {
  const result = await db
    .update(storage)
    .set({
      ...(data.folderId !== undefined && { folderId: data.folderId }),
      ...(data.fileName !== undefined && { fileName: data.fileName }),
    })
    .where(
      and(
        eq(storage.id, fileId),
        isNull(storage.deletedAt)
      )
    )
    .returning({
      id: storage.id,
      userId: storage.userId,
      folderId: storage.folderId,
      fileUrl: storage.fileUrl,
      fileName: storage.fileName,
      fileSize: storage.fileSize,
      uploadedAt: storage.uploadedAt,
      deletedAt: storage.deletedAt,
    });

  return result[0] || null;
}

/**
 * Soft delete souboru
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    await db
      .update(storage)
      .set({ deletedAt: new Date() })
      .where(eq(storage.id, fileId));
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}

/**
 * Získání statistik úložiště
 */
export async function getStorageStats() {
  const [totalFiles, totalSize, foldersCount] = await Promise.all([
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(storage)
      .where(isNull(storage.deletedAt)),
    db
      .select({ total: sql<number>`COALESCE(SUM(${storage.fileSize}), 0)` })
      .from(storage)
      .where(isNull(storage.deletedAt)),
    db.select({ count: sql<number>`COUNT(*)` }).from(folders),
  ]);

  return {
    totalFiles: Number(totalFiles[0]?.count) || 0,
    totalSize: Number(totalSize[0]?.total) || 0,
    foldersCount: Number(foldersCount[0]?.count) || 0,
  };
}

/**
 * Získání souborů podle uživatele
 */
export async function getFilesByUserId(
  userId: string
): Promise<StorageFileWithRelations[]> {
  const result = await db
    .select({
      id: storage.id,
      userId: storage.userId,
      folderId: storage.folderId,
      fileUrl: storage.fileUrl,
      fileName: storage.fileName,
      fileSize: storage.fileSize,
      uploadedAt: storage.uploadedAt,
      deletedAt: storage.deletedAt,
      user: {
        id: users.id,
        name: users.name,
        surname: users.surname,
        image: users.image,
      },
      folder: {
        id: folders.id,
        name: folders.name,
        color: folders.color,
      },
    })
    .from(storage)
    .leftJoin(users, eq(storage.userId, users.id))
    .leftJoin(folders, eq(storage.folderId, folders.id))
    .where(
      and(
        eq(storage.userId, userId),
        isNull(storage.deletedAt)
      )
    )
    .orderBy(desc(storage.uploadedAt));

  return result.map((file) => ({
    id: file.id,
    userId: file.userId,
    folderId: file.folderId,
    fileUrl: file.fileUrl,
    fileName: file.fileName,
    fileSize: file.fileSize,
    uploadedAt: file.uploadedAt,
    deletedAt: file.deletedAt,
    user: file.user?.id ? {
      id: file.user.id,
      name: file.user.name,
      surname: file.user.surname,
      image: file.user.image,
    } : null,
    folder: file.folder?.id ? {
      id: file.folder.id,
      name: file.folder.name,
      color: file.folder.color,
    } : null,
  }));
}

/**
 * Získání statistik úložiště pro konkrétního uživatele
 */
export async function getStorageStatsByUserId(userId: string) {
  const [totalFiles, totalSize] = await Promise.all([
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(storage)
      .where(and(eq(storage.userId, userId), isNull(storage.deletedAt))),
    db
      .select({ total: sql<number>`COALESCE(SUM(${storage.fileSize}), 0)` })
      .from(storage)
      .where(and(eq(storage.userId, userId), isNull(storage.deletedAt))),
  ]);

  return {
    totalFiles: Number(totalFiles[0]?.count) || 0,
    totalSize: Number(totalSize[0]?.total) || 0,
  };
}

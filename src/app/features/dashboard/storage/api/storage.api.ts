import { apiFetch, apiFetchOrThrow, parseApiError } from "@/lib/utils/api";
import type { StorageFileRecord, StorageFolder } from "../types";

export async function listStorageFolders() {
  const response = await apiFetchOrThrow("/api/dashboard/storage?type=folders");
  const json = await response.json();
  return (json.folders ?? []) as StorageFolder[];
}

export async function listStorageRootFiles() {
  const response = await apiFetchOrThrow("/api/dashboard/storage?type=files");
  const json = await response.json();
  return (json.files ?? []) as StorageFileRecord[];
}

export async function listStorageFolderFiles(folderId: string) {
  const response = await apiFetchOrThrow(
    `/api/dashboard/storage?folderId=${encodeURIComponent(folderId)}`,
  );
  const json = await response.json();
  return (json.files ?? []) as StorageFileRecord[];
}

export async function createStorageFolder(name: string, color?: string) {
  const response = await apiFetch("/api/dashboard/storage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "folder",
      name,
      ...(color ? { color } : {}),
    }),
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

export async function createStorageFileRecord(body: {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  folderId?: string;
}) {
  const response = await apiFetch("/api/dashboard/storage", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "file",
      ...body,
    }),
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  const json = await response.json();
  return (json.file ?? null) as StorageFileRecord | null;
}

export async function deleteStorageFile(fileId: string) {
  const response = await apiFetch(`/api/dashboard/storage?id=${fileId}&type=file`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

/**
 * Importuje soubor do úložiště z externí URL (obrázky a videa).
 * @param {Object} body - Payload importu.
 * @param {string} body.url - Zdrojová URL.
 * @param {string | null | undefined} body.folderId - Cílová složka.
 * @returns {Promise<StorageFileRecord | null>} Vytvořený záznam souboru.
 */
export async function importStorageFileFromUrl(body: {
  url: string;
  folderId?: string | null;
}) {
  const response = await apiFetch("/api/dashboard/storage/import", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    await parseApiError(response);
  }

  const json = await response.json();
  return (json.file ?? null) as StorageFileRecord | null;
}

export async function renameStorageFile(fileId: string, fileName: string) {
  const response = await apiFetch("/api/dashboard/storage", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: fileId, type: "file", fileName }),
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

export async function moveStorageFile(fileId: string, folderId: string | null) {
  const response = await apiFetch("/api/dashboard/storage", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: fileId, type: "file", folderId }),
  });

  if (!response.ok) {
    await parseApiError(response);
  }
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUploadFiles } from "@better-upload/client";
import { localizeUploadErrorMessage } from "@/utils/uploadError";
import {
  createStorageFileRecord,
  createStorageFolder,
  deleteStorageFile,
  importStorageFileFromUrl,
  listStorageFolders,
  listStorageRootFiles,
  moveStorageFile,
  renameStorageFile,
} from "../api/storage.api";
import type { StorageFileRecord, StorageFolder } from "../types";

export function useStoragePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [folders, setFolders] = useState<StorageFolder[]>([]);
  const [files, setFiles] = useState<StorageFileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState("#FFFFFF");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<StorageFileRecord | null>(
    null,
  );
  const [editedFileName, setEditedFileName] = useState("");
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [isRenamingFile, setIsRenamingFile] = useState(false);
  const [isMovingFile, setIsMovingFile] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<StorageFileRecord | null>(
    null,
  );
  const [isDeletingFile, setIsDeletingFile] = useState(false);
  const [isImportUrlModalOpen, setIsImportUrlModalOpen] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [isImportingUrl, setIsImportingUrl] = useState(false);
  const [importUrlError, setImportUrlError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const [foldersData, filesData] = await Promise.all([
        listStorageFolders(),
        listStorageRootFiles(),
      ]);
      setFolders(foldersData);
      setFiles(filesData.filter((file) => !file.folderId));
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Nastala chyba");
    }
  }, []);

  const { upload } = useUploadFiles({
    route: "storage",
    onUploadComplete: async (result: any) => {
      try {
        const uploadedFiles = Array.isArray(result?.files) ? result.files : [];

        if (!uploadedFiles.length) {
          setUploadError("Nepodařilo se získat informace o nahraných souborech");
          return;
        }

        const endpoint = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL;
        const cleanEndpoint = endpoint ? endpoint.replace(/\/$/, "") : null;

        for (const file of uploadedFiles) {
          let fileUrl: string | null = null;
          const key = file?.objectKey || file?.objectInfo?.key;

          if (file?.url) {
            fileUrl = file.url;
          } else if (key && cleanEndpoint) {
            fileUrl = `${cleanEndpoint}/${key}`;
          } else if (result?.url) {
            fileUrl = result.url;
          }

          if (!fileUrl) {
            continue;
          }

          const fileName: string =
            file?.name || file?.metadata?.fileName || key || "soubor";
          const fileSize: number = file?.size || file?.metadata?.fileSize || 0;

          await createStorageFileRecord({
            fileUrl,
            fileName,
            fileSize: Math.max(fileSize, 1),
          });
        }

        await refreshData();
      } catch (saveError) {
        setUploadError(
          saveError instanceof Error
            ? saveError.message
            : "Nepodařilo se uložit soubory",
        );
      } finally {
        setIsUploading(false);
      }
    },
    onError: (uploadErrorMessage) => {
      setUploadError(localizeUploadErrorMessage(uploadErrorMessage?.message));
      setIsUploading(false);
    },
  });

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        await refreshData();
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, [refreshData]);

  const handleOpenFolderModal = useCallback(() => {
    setFolderName("");
    setFolderColor("#FFFFFF");
    setIsFolderModalOpen(true);
  }, []);

  const closeFolderModal = useCallback(() => {
    setIsFolderModalOpen(false);
  }, []);

  const handleCreateFolder = useCallback(async () => {
    try {
      const color =
        folderColor && /^#[0-9A-Fa-f]{6}$/.test(folderColor)
          ? folderColor
          : undefined;

      await createStorageFolder(folderName, color);
      await refreshData();
      setIsFolderModalOpen(false);
    } catch (saveError) {
      alert(saveError instanceof Error ? saveError.message : "Nastala chyba");
    }
  }, [folderColor, folderName, refreshData]);

  const handleOpenUpload = useCallback(() => {
    setUploadError(null);
    fileInputRef.current?.click();
  }, []);

  const handleOpenImportFromUrl = useCallback(() => {
    setImportUrlError(null);
    setImportUrl("");
    setIsImportUrlModalOpen(true);
  }, []);

  const closeImportFromUrlModal = useCallback(() => {
    setIsImportUrlModalOpen(false);
    setImportUrlError(null);
  }, []);

  const handleImportFromUrl = useCallback(async () => {
    const trimmed = importUrl.trim();
    if (!trimmed) {
      setImportUrlError("URL nesmí být prázdná.");
      return;
    }

    setIsImportingUrl(true);
    setImportUrlError(null);

    try {
      await importStorageFileFromUrl({ url: trimmed });
      await refreshData();
      setIsImportUrlModalOpen(false);
      setImportUrl("");
    } catch (error) {
      setImportUrlError(
        error instanceof Error ? error.message : "Nepodařilo se importovat soubor",
      );
    } finally {
      setIsImportingUrl(false);
    }
  }, [importUrl, refreshData]);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextFiles = event.target.files;
      if (!nextFiles || !nextFiles.length) {
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        await upload(Array.from(nextFiles));
      } catch (uploadFailure) {
        setUploadError(
          localizeUploadErrorMessage(
            uploadFailure instanceof Error
              ? uploadFailure.message
              : "Nepodařilo se nahrát soubory",
          ),
        );
        setIsUploading(false);
      } finally {
        event.target.value = "";
      }
    },
    [upload],
  );

  const handleRequestDeleteFile = useCallback((file: StorageFileRecord) => {
    setFileToDelete(file);
    setIsDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false);
    setFileToDelete(null);
  }, []);

  const handleDeleteFile = useCallback(async () => {
    if (!fileToDelete) {
      return;
    }

    try {
      setIsDeletingFile(true);
      await deleteStorageFile(fileToDelete.id);
      setFiles((current) => current.filter((file) => file.id !== fileToDelete.id));

      if (selectedFile?.id === fileToDelete.id) {
        setIsRenameModalOpen(false);
        setIsMoveModalOpen(false);
        setSelectedFile(null);
      }

      closeDeleteModal();
    } catch (deleteError) {
      alert(deleteError instanceof Error ? deleteError.message : "Nastala chyba");
    } finally {
      setIsDeletingFile(false);
    }
  }, [closeDeleteModal, fileToDelete, selectedFile]);

  const handleOpenRenameModal = useCallback((file: StorageFileRecord) => {
    setSelectedFile(file);
    setEditedFileName(file.fileName);
    setIsRenameModalOpen(true);
  }, []);

  const closeRenameModal = useCallback(() => {
    setIsRenameModalOpen(false);
    setSelectedFile(null);
  }, []);

  const handleOpenMoveModal = useCallback((file: StorageFileRecord) => {
    setSelectedFile(file);
    setSelectedFolderId(file.folderId ?? "");
    setIsMoveModalOpen(true);
  }, []);

  const closeMoveModal = useCallback(() => {
    setIsMoveModalOpen(false);
    setSelectedFile(null);
  }, []);

  const handleRenameFile = useCallback(async () => {
    if (!selectedFile) {
      return;
    }

    const trimmedName = editedFileName.trim();
    if (!trimmedName) {
      alert("Název souboru nesmí být prázdný.");
      return;
    }

    setIsRenamingFile(true);
    try {
      await renameStorageFile(selectedFile.id, trimmedName);
      await refreshData();
      closeRenameModal();
    } catch (renameError) {
      alert(
        renameError instanceof Error
          ? renameError.message
          : "Nepodařilo se přejmenovat soubor",
      );
    } finally {
      setIsRenamingFile(false);
    }
  }, [closeRenameModal, editedFileName, refreshData, selectedFile]);

  const handleMoveFile = useCallback(async () => {
    if (!selectedFile) {
      return;
    }

    setIsMovingFile(true);
    try {
      await moveStorageFile(selectedFile.id, selectedFolderId || null);
      await refreshData();
      closeMoveModal();
    } catch (moveError) {
      alert(
        moveError instanceof Error
          ? moveError.message
          : "Nepodařilo se přesunout soubor",
      );
    } finally {
      setIsMovingFile(false);
    }
  }, [closeMoveModal, refreshData, selectedFile, selectedFolderId]);

  const openFolder = useCallback(
    (folderId: string) => {
      router.push(`/dashboard/storage/${folderId}`);
    },
    [router],
  );

  return {
    fileInputRef,
    folders,
    files,
    loading,
    error,
    isFolderModalOpen,
    folderName,
    folderColor,
    isUploading,
    uploadError,
    isImportUrlModalOpen,
    importUrl,
    isImportingUrl,
    importUrlError,
    isRenameModalOpen,
    isMoveModalOpen,
    selectedFile,
    editedFileName,
    selectedFolderId,
    isRenamingFile,
    isMovingFile,
    isDeleteModalOpen,
    fileToDelete,
    isDeletingFile,
    setFolderName,
    setFolderColor,
    setEditedFileName,
    setSelectedFolderId,
    setImportUrl,
    handleOpenFolderModal,
    closeFolderModal,
    handleCreateFolder,
    handleOpenUpload,
    handleOpenImportFromUrl,
    closeImportFromUrlModal,
    handleImportFromUrl,
    handleFileChange,
    handleRequestDeleteFile,
    closeDeleteModal,
    handleDeleteFile,
    handleOpenRenameModal,
    closeRenameModal,
    handleOpenMoveModal,
    closeMoveModal,
    handleRenameFile,
    handleMoveFile,
    openFolder,
  };
}

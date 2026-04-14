"use client";

import { useState } from "react";
import { useUploadFiles } from "@better-upload/client";
import { createStorageFileRecord } from "@/app/features/dashboard/storage/api/storage.api";
import { localizeUploadErrorMessage } from "@/utils/uploadError";

interface UseArticleCoverUploadOptions {
  onUploaded: (url: string) => void;
}

function resolveUploadedFileUrl(result: unknown, file: unknown) {
  const uploadResult = result as {
    url?: string;
  };
  const uploadFile = file as {
    url?: string;
    objectKey?: string;
    objectInfo?: { key?: string };
  };

  const endpoint = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL;
  const cleanEndpoint = endpoint ? endpoint.replace(/\/$/, "") : null;
  const key = uploadFile.objectKey || uploadFile.objectInfo?.key;

  if (uploadFile.url) {
    return uploadFile.url;
  }

  if (key && cleanEndpoint) {
    return `${cleanEndpoint}/${key}`;
  }

  return uploadResult.url ?? null;
}

export function useArticleCoverUpload({
  onUploaded,
}: UseArticleCoverUploadOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { upload } = useUploadFiles({
    route: "storage",
    onUploadComplete: async (result) => {
      try {
        const uploadResult = result as {
          files?: unknown[];
        };
        const uploadedFiles = Array.isArray(uploadResult.files)
          ? uploadResult.files
          : [];

        for (const file of uploadedFiles) {
          const uploadFile = file as {
            name?: string;
            size?: number;
            metadata?: { fileName?: string; fileSize?: number };
            objectKey?: string;
            objectInfo?: { key?: string };
          };
          const fileUrl = resolveUploadedFileUrl(result, file);

          if (!fileUrl) {
            continue;
          }

          const key = uploadFile.objectKey || uploadFile.objectInfo?.key;
          const fileName =
            uploadFile.name || uploadFile.metadata?.fileName || key || "obrázek";
          const fileSize = uploadFile.size || uploadFile.metadata?.fileSize || 0;

          await createStorageFileRecord({
            fileUrl,
            fileName,
            fileSize: Math.max(fileSize, 1),
          });

          onUploaded(fileUrl);
        }
      } catch {
        setUploadError("Nepodařilo se uložit informace o nahraném obrázku.");
      } finally {
        setIsUploading(false);
      }
    },
    onError: (error) => {
      setUploadError(localizeUploadErrorMessage(error?.message));
      setIsUploading(false);
    },
  });

  const handleUpload = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/"),
    );

    if (files.length === 0) {
      setUploadError("Můžeš nahrávat pouze obrázky.");
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      await upload(files);
    } catch {
      setUploadError("Nahrávání selhalo.");
      setIsUploading(false);
    }
  };

  return {
    isDragging,
    isUploading,
    uploadError,
    setIsDragging,
    clearUploadError: () => setUploadError(null),
    handleUpload,
  };
}

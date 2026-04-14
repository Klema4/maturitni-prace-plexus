"use client";

import { useState } from "react";
import { useUploadFiles } from "@better-upload/client";
import { localizeUploadErrorMessage } from "@/utils/uploadError";

type UseCompanyAdsBannerUploadOptions = {
  onUploaded: (url: string) => void;
};

function resolveUploadedBannerUrl(result: unknown, file: unknown) {
  const uploadResult = result as {
    url?: string;
  };
  const uploadFile = file as {
    url?: string;
    objectKey?: string;
    objectInfo?: { key?: string };
  };

  if (uploadFile.url) {
    return uploadFile.url;
  }

  const key = uploadFile.objectKey || uploadFile.objectInfo?.key;
  const endpoint = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL;
  const cleanEndpoint = endpoint ? endpoint.replace(/\/$/, "") : null;

  if (key && cleanEndpoint) {
    return `${cleanEndpoint}/ads/${key}`;
  }

  return uploadResult.url ?? null;
}

export function useCompanyAdsBannerUpload({
  onUploaded,
}: UseCompanyAdsBannerUploadOptions) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { upload } = useUploadFiles({
    route: "ads",
    onUploadComplete: async (result) => {
      const uploadResult = result as {
        files?: unknown[];
      };
      const uploadedFiles = Array.isArray(uploadResult.files)
        ? uploadResult.files
        : [];

      for (const file of uploadedFiles) {
        const fileUrl = resolveUploadedBannerUrl(result, file);

        if (!fileUrl) {
          continue;
        }

        onUploaded(fileUrl);
      }

      setIsUploading(false);
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
      await upload(files.slice(0, 1));
    } catch (error) {
      setUploadError(
        localizeUploadErrorMessage(
          error instanceof Error ? error.message : undefined,
        ),
      );
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadError,
    clearUploadError: () => setUploadError(null),
    handleUpload,
  };
}

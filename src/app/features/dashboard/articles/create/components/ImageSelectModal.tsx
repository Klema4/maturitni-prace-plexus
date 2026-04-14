"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import {
  Image as ImageIcon,
  Loader2,
  Search,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/dashboard/Modal";
import Button from "@/components/ui/dashboard/Button";
import { Card } from "@/components/ui/dashboard/Card";
import { Input } from "@/components/ui/dashboard/Inputs";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import FilePreview from "@/components/ui/dashboard/FilePreview";
import { useUploadFiles } from "@better-upload/client";
import {
  createStorageFileRecord,
  listStorageRootFiles,
} from "@/app/features/dashboard/storage/api/storage.api";
import type { StorageFileRecord } from "@/app/features/dashboard/storage/types";
import { localizeUploadErrorMessage } from "@/utils/uploadError";
import { clsx } from "clsx";

interface ImageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

const IMAGE_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "avif",
  "svg",
]);

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isImageFile(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  return IMAGE_EXTENSIONS.has(extension);
}

function sortFilesByUploadedAt(files: StorageFileRecord[]) {
  return [...files].sort(
    (left, right) =>
      new Date(right.uploadedAt).getTime() - new Date(left.uploadedAt).getTime(),
  );
}

export default function ImageSelectModal({
  isOpen,
  onClose,
  onSelect,
}: ImageSelectModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<StorageFileRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);

    try {
      const allFiles = await listStorageRootFiles();
      const imageFiles = allFiles.filter((file) => isImageFile(file.fileName));
      setFiles(sortFilesByUploadedAt(imageFiles));
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Nepodařilo se načíst knihovnu obrázků.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setSearchQuery("");
    setUploadError(null);
    void fetchFiles();
  }, [fetchFiles, isOpen]);

  const { upload } = useUploadFiles({
    route: "storage",
    onUploadComplete: async (result: unknown) => {
      try {
        const uploadResult = result as {
          files?: Array<{
            url?: string;
            objectKey?: string;
            objectInfo?: { key?: string };
            name?: string;
            size?: number;
            metadata?: { fileName?: string; fileSize?: number };
          }>;
          url?: string;
        };
        const uploadedFiles = Array.isArray(uploadResult.files)
          ? uploadResult.files
          : [];

        if (!uploadedFiles.length) {
          setUploadError("Upload skončil bez dostupných dat o souboru.");
          return;
        }

        const endpoint = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL;
        const cleanEndpoint = endpoint ? endpoint.replace(/\/$/, "") : null;
        const createdFiles: StorageFileRecord[] = [];

        for (const file of uploadedFiles) {
          let fileUrl: string | null = null;
          const key = file.objectKey || file.objectInfo?.key;

          if (file.url) {
            fileUrl = file.url;
          } else if (key && cleanEndpoint) {
            fileUrl = `${cleanEndpoint}/${key}`;
          } else if (uploadResult.url) {
            fileUrl = uploadResult.url;
          }

          if (!fileUrl) {
            continue;
          }

          const createdFile = await createStorageFileRecord({
            fileUrl,
            fileName: file.name || file.metadata?.fileName || key || "obrázek",
            fileSize: Math.max(file.size || file.metadata?.fileSize || 0, 1),
          });

          if (createdFile) {
            createdFiles.push(createdFile);
          }
        }

        if (createdFiles.length > 0) {
          setFiles((current) => {
            const merged = [...createdFiles, ...current];
            const deduped = merged.filter(
              (file, index, array) =>
                array.findIndex((candidate) => candidate.id === file.id) === index,
            );

            return sortFilesByUploadedAt(
              deduped.filter((file) => isImageFile(file.fileName)),
            );
          });
        } else {
          await fetchFiles();
        }
      } catch (error) {
        setUploadError(
          error instanceof Error
            ? error.message
            : "Nepodařilo se uložit informace o nahraném obrázku.",
        );
      } finally {
        setIsUploading(false);
      }
    },
    onError: (error) => {
      setUploadError(localizeUploadErrorMessage(error?.message));
      setIsUploading(false);
    },
  });

  const handleUpload = useCallback(
    async (fileList: FileList | File[]) => {
      const imageFiles = Array.from(fileList).filter((file) =>
        file.type.startsWith("image/"),
      );

      if (imageFiles.length === 0) {
        setUploadError("Můžeš nahrávat pouze obrázky.");
        return;
      }

      setIsUploading(true);
      setUploadError(null);

      try {
        await upload(imageFiles);
      } catch (error) {
        setUploadError(
          localizeUploadErrorMessage(
            error instanceof Error ? error.message : "Nahrávání selhalo.",
          ),
        );
        setIsUploading(false);
      }
    },
    [upload],
  );

  const filteredFiles = useMemo(
    () =>
      files.filter((file) =>
        file.fileName.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [files, searchQuery],
  );

  const getFileAccessUrl = (fileId: string) =>
    `/api/dashboard/storage/file?fileId=${encodeURIComponent(fileId)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="2xl">
      <ModalHeader onClose={onClose}>Vybrat obrázek</ModalHeader>
      <ModalBody className="space-y-5">
        <section>
          <div className="flex flex-col gap-4">
            <div className="w-full relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              />
              <Input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Hledat obrázek podle názvu"
                className="w-full pl-10"
              />
            </div>

            <div
              className={clsx(
                "cursor-pointer rounded-2xl border border-dashed px-5 py-6 transition-colors",
                isDragging
                  ? "border-zinc-500 bg-zinc-900/90"
                  : "border-zinc-700/80 bg-zinc-900/55 hover:border-zinc-600 hover:bg-zinc-900/80",
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                void handleUpload(event.dataTransfer.files);
              }}
            >
              <div className="flex flex-col items-center justify-center gap-3 text-center">
                {isUploading ? (
                  <>
                    <Loader2 size={24} className="animate-spin text-zinc-300" />
                    <div className="space-y-1">
                      <Paragraph textAlign="center" color="primary" fontWeight="semibold">
                        Nahrávám obrázek...
                      </Paragraph>
                      <Paragraph textAlign="center" size="small" color="muted">
                        Po dokončení se objeví v knihovně níže.
                      </Paragraph>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="rounded-full border border-zinc-700 bg-zinc-800 p-3 text-zinc-200">
                      <Sparkles size={18} />
                    </div>
                    <div className="space-y-1.5">
                      <Heading variant="h6">Přidat do knihovny</Heading>
                      <Paragraph size="small" color="muted">
                        Přetáhni obrázek sem nebo ho vyber z počítače.
                      </Paragraph>
                      <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800/80 px-3 py-1 text-xs font-medium tracking-tight text-zinc-300">
                        <Upload size={12} />
                        Klikni nebo přetáhni soubor
                      </div>
                    </div>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) => {
                  if (event.target.files) {
                    void handleUpload(event.target.files);
                    event.target.value = "";
                  }
                }}
              />
            </div>

            {uploadError ? (
              <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm tracking-tight text-red-300">
                <span>{uploadError}</span>
                <button
                  type="button"
                  onClick={() => setUploadError(null)}
                  className="rounded p-1 transition-colors hover:bg-red-500/10"
                  aria-label="Skrýt chybu nahrávání"
                >
                  <X size={14} />
                </button>
              </div>
            ) : null}
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <Heading variant="h6">Dostupné obrázky</Heading>
            <Paragraph size="extrasmall" color="muted">
              {filteredFiles.length} položek
            </Paragraph>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-zinc-800/70 bg-zinc-900/40 py-12">
              <Loader2 size={28} className="animate-spin text-zinc-500" />
              <Paragraph color="muted">Načítám obrázky...</Paragraph>
            </div>
          ) : filteredFiles.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFiles.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => onSelect(getFileAccessUrl(file.id))}
                  className="cursor-pointer text-left"
                >
                  <Card
                    padding="compact"
                    interactive
                    className="bg-zinc-800/25! border-zinc-700/25! hover:border-zinc-700/50! hover:bg-zinc-800/50!"
                  >
                    <FilePreview
                      fileName={file.fileName}
                      fileUrl={getFileAccessUrl(file.id)}
                    />
                    <div className="p-2">
                      <div className="min-w-0 space-y-1">
                        <h5
                          className="truncate text-sm font-semibold tracking-tight text-zinc-200"
                          title={file.fileName}
                        >
                          {file.fileName}
                        </h5>
                      </div>
                    </div>
                  </Card>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-zinc-800/70 bg-zinc-900/40 py-12 text-center">
              <ImageIcon size={32} className="mb-2 text-zinc-700" />
              <Paragraph color="muted">
                {searchQuery
                  ? "Žádný obrázek neodpovídá hledání."
                  : "V úložišti zatím nejsou žádné obrázky."}
              </Paragraph>
            </div>
          )}
        </section>
      </ModalBody>
      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Zavřít
        </Button>
      </ModalFooter>
    </Modal>
  );
}

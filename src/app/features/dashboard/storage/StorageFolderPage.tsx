"use client";

import { use } from "react";
import Avatar from "@/components/ui/dashboard/Avatar";
import { Card } from "@/components/ui/dashboard/Card";
import FilePreview from "@/components/ui/dashboard/FilePreview";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import QuickOptions from "@/components/ui/dashboard/QuickOptions";
import Button from "@/components/ui/dashboard/Button";
import { Input } from "@/components/ui/dashboard/Inputs";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/dashboard/Modal";
import { ArrowLeft, Folder, Upload, Trash, Pencil, Link } from "lucide-react";
import { format } from "date-fns";
import { useStorageFolderPage } from "./hooks/useStorageFolderPage";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function StorageFolderPage({
  params,
}: {
  params: Promise<{ folder: string }>;
}) {
  const { folder: folderId } = use(params);
  const {
    fileInputRef,
    folder,
    folders,
    files,
    loading,
    error,
    uploadError,
    isUploading,
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
    setEditedFileName,
    setSelectedFolderId,
    setImportUrl,
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
    goBack,
  } = useStorageFolderPage(folderId);

  const getFileAccessUrl = (fileId: string) =>
    `/api/dashboard/storage/file?fileId=${encodeURIComponent(fileId)}`;

  if (loading) {
    return (
      <>
        <header>
          <Heading variant="h1">Úložiště</Heading>
          <Paragraph>
            Načítám obsah složky v úložišti, prosím čekej.
          </Paragraph>
        </header>
        <div className="mt-4 flex items-center justify-center">
          <Paragraph color="muted">Načítám složku...</Paragraph>
        </div>
      </>
    );
  }

  if (error || !folder) {
    return (
      <>
        <header>
          <Heading variant="h1">Úložiště</Heading>
          <Paragraph>
            Zde můžeš spravovat soubory, které jsou uloženy v úložišti.
          </Paragraph>
        </header>
        <div className="mt-4 space-y-4">
          <Paragraph color="muted" className="text-red-400">
            {error || "Složka nebyla nalezena"}
          </Paragraph>
          <Button href="/dashboard/storage" variant="outline">
            Zpět na přehled úložiště
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex cursor-pointer items-center justify-center rounded-lg bg-zinc-800 p-2 text-zinc-300 transition-colors hover:bg-zinc-700"
            onClick={goBack}
            title="Zpět na úložiště"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div>
              <Heading variant="h1">{folder.name}</Heading>
            </div>
          </div>
        </div>
      </header>

      <QuickOptions
        options={[
          {
            label: isUploading ? "Nahrávám..." : "Nahrát soubor",
            variant: "primary",
            icon: Upload,
            onClick: handleOpenUpload,
            disabled: isUploading,
          },
          {
            label: "Nahrát z URL",
            variant: "primary",
            icon: Link,
            onClick: handleOpenImportFromUrl,
            disabled: isUploading || isImportingUrl,
          },
        ]}
      />

      {uploadError && (
        <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm tracking-tight text-red-300">
          {uploadError}
        </div>
      )}
      {importUrlError && (
        <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm tracking-tight text-red-300">
          {importUrlError}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <section className="mt-4">
        <Heading variant="h4">Soubory ve složce</Heading>
        <div className="mt-2 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {files.map((file) => (
            <Card key={file.id} padding="compact">
              <a
                href={getFileAccessUrl(file.id)}
                target="_blank"
                rel="noreferrer"
                className="block w-full"
              >
                <FilePreview
                  fileName={file.fileName}
                  fileUrl={getFileAccessUrl(file.id)}
                />
              </a>
              <div className="p-2">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <Avatar
                      src={file.user?.image || undefined}
                      alt={
                        file.user
                          ? `${file.user.name} ${file.user.surname}`
                          : "Neznámý uživatel"
                      }
                      size="xs"
                      title={
                        file.user
                          ? `Nahrál: ${file.user.name} ${file.user.surname}`
                          : "Nahrál: Neznámý uživatel"
                      }
                    />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                        onClick={() => handleOpenRenameModal(file)}
                        title="Přejmenovat soubor"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                        onClick={() => handleOpenMoveModal(file)}
                        title="Přesunout do složky"
                      >
                        <Folder size={16} />
                      </button>
                      <button
                        type="button"
                        className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-red-400"
                        onClick={() => handleRequestDeleteFile(file)}
                        title="Smazat soubor"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                  <h5
                    className="truncate text-sm font-semibold tracking-tight"
                    title={file.fileName}
                  >
                    {file.fileName}
                  </h5>
                  <div className="mt-1 flex items-center justify-between text-xs font-medium tracking-tight text-zinc-400">
                    <p>{formatFileSize(file.fileSize)}</p>
                    <p>{format(new Date(file.uploadedAt), "d.M.yyyy HH:mm")}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          {files.length === 0 && (
            <Paragraph color="muted" className="col-span-full text-sm">
              V této složce zatím nejsou nahrané žádné soubory.
            </Paragraph>
          )}
        </div>
      </section>

      <Modal isOpen={isImportUrlModalOpen} onClose={closeImportFromUrlModal} size="md">
        <ModalHeader onClose={closeImportFromUrlModal}>Nahrát z URL</ModalHeader>
        <ModalBody className="space-y-4">
          <Input
            label="URL souboru"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="https://…"
            maxLength={1024}
            required
          />
          <Paragraph color="muted" className="text-sm">
            Podporované jsou obrázky a videa. Maximální velikost je 50 MB.
          </Paragraph>
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full items-center justify-end gap-2">
            <Button href="#" variant="outline" onClick={closeImportFromUrlModal}>
              Zrušit
            </Button>
            <button
              type="button"
              className="cursor-pointer rounded-lg bg-white px-2 py-1 text-sm font-medium -tracking-[0.01em] text-zinc-900 transition-all hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white/40 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                void handleImportFromUrl();
              }}
              disabled={isImportingUrl || !importUrl.trim()}
            >
              {isImportingUrl ? "Nahrávám..." : "Nahrát"}
            </button>
          </div>
        </ModalFooter>
      </Modal>

      <Modal isOpen={isRenameModalOpen} onClose={closeRenameModal} size="md">
        <ModalHeader onClose={closeRenameModal}>Přejmenovat soubor</ModalHeader>
        <ModalBody className="space-y-4">
          <Input
            label="Název souboru"
            value={editedFileName}
            onChange={(e) => setEditedFileName(e.target.value)}
            maxLength={256}
            required
          />
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full items-center justify-end gap-2">
            <Button href="#" variant="outline" onClick={closeRenameModal}>
              Zrušit
            </Button>
            <button
              type="button"
              className="cursor-pointer rounded-lg bg-white px-2 py-1 text-sm font-medium -tracking-[0.01em] text-zinc-900 transition-all hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white/40 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                void handleRenameFile();
              }}
              disabled={isRenamingFile || !editedFileName.trim()}
            >
              {isRenamingFile ? "Ukládám..." : "Uložit název"}
            </button>
          </div>
        </ModalFooter>
      </Modal>

      <Modal isOpen={isMoveModalOpen} onClose={closeMoveModal} size="md">
        <ModalHeader onClose={closeMoveModal}>Přesunout soubor</ModalHeader>
        <ModalBody className="space-y-4">
          <p className="text-sm font-medium tracking-tight text-zinc-300">
            {selectedFile?.fileName}
          </p>
          <div className="space-y-1.5">
            <label
              htmlFor="folder-file-folder-select"
              className="block text-sm font-medium tracking-tight text-white"
            >
              Vyber složku
            </label>
            <select
              id="folder-file-folder-select"
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="w-full rounded-md border border-zinc-700/50 bg-zinc-800/75 px-3 py-2.5 text-sm font-medium tracking-tight text-white transition-all focus:outline-none focus:ring-2 focus:ring-white/75"
            >
              <option value="">Bez složky (kořen)</option>
              {folders.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full items-center justify-end gap-2">
            <Button href="#" variant="outline" onClick={closeMoveModal}>
              Zrušit
            </Button>
            <button
              type="button"
              className="cursor-pointer rounded-lg bg-white px-2 py-1 text-sm font-medium -tracking-[0.01em] text-zinc-900 transition-all hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white/40 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                void handleMoveFile();
              }}
              disabled={isMovingFile}
            >
              {isMovingFile ? "Přesouvám..." : "Přesunout"}
            </button>
          </div>
        </ModalFooter>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} size="md">
        <ModalHeader onClose={closeDeleteModal}>Smazat soubor</ModalHeader>
        <ModalBody className="space-y-3">
          <p className="text-sm font-medium tracking-tight text-zinc-200">
            Opravdu chceš smazat tento soubor z úložiště?
          </p>
          <p className="rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-semibold tracking-tight text-zinc-300">
            {fileToDelete?.fileName}
          </p>
        </ModalBody>
        <ModalFooter>
          <div className="flex w-full items-center justify-end gap-2">
            <Button href="#" variant="outline" onClick={closeDeleteModal}>
              Zrušit
            </Button>
            <button
              type="button"
              className="cursor-pointer rounded-lg bg-red-500 px-2 py-1 text-sm font-medium -tracking-[0.01em] text-white transition-all hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-800/40 active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => {
                void handleDeleteFile();
              }}
              disabled={isDeletingFile}
            >
              {isDeletingFile ? "Mažu..." : "Smazat"}
            </button>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
}

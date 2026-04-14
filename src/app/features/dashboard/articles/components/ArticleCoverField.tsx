"use client";

import { useId, useState } from "react";
import { ChevronDown, ChevronUp, ImageIcon, Loader2, Upload, X } from "lucide-react";
import Button from "@/components/ui/dashboard/Button";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { clsx } from "clsx";
import ImageSelectModal from "@/app/features/dashboard/articles/create/components/ImageSelectModal";
import { useArticleCoverUpload } from "@/app/features/dashboard/articles/hooks/useArticleCoverUpload";

/**
 * Pole pro titulní obrázek článku v dashboard editoru.
 * Umožňuje upload / výběr z knihovny a volitelný náhled použití obrázku.
 * @param {Object} props - Props komponenty.
 * @param {string} props.value - URL aktuálně vybraného obrázku.
 * @param {(value: string) => void} props.onChange - Callback pro změnu URL obrázku.
 * @returns {JSX.Element} UI pro práci s titulním obrázkem.
 */
interface ArticleCoverFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export default function ArticleCoverField({
  value,
  onChange,
}: ArticleCoverFieldProps) {
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const inputId = useId();
  const {
    isDragging,
    isUploading,
    uploadError,
    setIsDragging,
    clearUploadError,
    handleUpload,
  } = useArticleCoverUpload({
    onUploaded: onChange,
  });

  return (
    <div className="space-y-3">
      <div
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
        className={clsx(
          "relative overflow-hidden rounded-xl border border-dashed bg-zinc-900/50 transition-colors",
          isDragging ? "border-zinc-500 bg-zinc-900" : "border-zinc-700/60",
        )}
      >
        {isUploading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 py-8">
            <Loader2 size={28} className="animate-spin text-zinc-300" />
            <Paragraph>Nahrávám titulní obrázek...</Paragraph>
          </div>
        ) : value ? (
          <div className="group relative">
            <img
              src={value}
              alt="Titulní obrázek článku"
              className="h-64 w-full object-cover"
            />
            <div className="absolute inset-0 flex items-end justify-between bg-linear-to-t from-black/70 via-black/10 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsImageModalOpen(true)}
                  className="bg-zinc-950/80"
                >
                  <ImageIcon size={16} />
                  Knihovna
                </Button>
                <label
                  htmlFor={inputId}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950/80 px-2 py-1 text-sm font-medium tracking-tight text-zinc-200 transition-colors hover:bg-zinc-900"
                >
                  <Upload size={16} />
                  Nahrát nový
                </label>
              </div>
              <Button
                variant="outline"
                onClick={() => onChange("")}
                className="bg-zinc-950/80 text-red-300 hover:text-red-200"
              >
                <X size={16} />
                Odebrat
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center gap-4 px-6 py-8 text-center">
            <div className="rounded-full bg-zinc-800 p-3 text-zinc-300">
              <Upload size={20} />
            </div>
            <div className="space-y-1">
              <Paragraph textAlign="center" fontWeight="semibold" color="primary">Titulní obrázek</Paragraph>
              <Paragraph textAlign="center" size="small" color="muted">
                Přetáhni obrázek sem nebo vyber soubor.
              </Paragraph>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <label
                htmlFor={inputId}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium tracking-tight text-zinc-950 transition-colors hover:bg-zinc-200"
              >
                <Upload size={16} />
                Nahrát soubor
              </label>
              <Button
                variant="outline"
                onClick={() => setIsImageModalOpen(true)}
              >
                <ImageIcon size={16} />
                Vybrat z knihovny
              </Button>
            </div>
          </div>
        )}

        <input
          id={inputId}
          type="file"
          accept="image/*"
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
        <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
          <span>{uploadError}</span>
          <button
            type="button"
            onClick={clearUploadError}
            className="rounded p-1 transition-colors hover:bg-red-500/10"
            aria-label="Skrýt chybu nahrávání"
          >
            <X size={14} />
          </button>
        </div>
      ) : null}

      {value ? <ArticleCoverPreviewStrip imageUrl={value} /> : null}

      <ImageSelectModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSelect={(url) => {
          onChange(url);
          setIsImageModalOpen(false);
          clearUploadError();
        }}
      />
    </div>
  );
}

function ArticleCoverPreviewStrip({ imageUrl }: { imageUrl: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="rounded-xl border border-zinc-800/50 bg-zinc-900/50">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 p-4 text-left"
        aria-expanded={isOpen}
      >
        <div className="space-y-1">
          <Heading variant="h6" className="tracking-tight">
            {isOpen ? "Skrýt náhled" : "Zobrazit náhled"}
          </Heading>
          <Paragraph size="small" color="muted">
            Ověř si výřez pro detail článku, běžnou kartu a hlavní článek na
            homepage.
          </Paragraph>
        </div>
        <span className="shrink-0 rounded-lg border border-zinc-700/60 bg-zinc-950/50 p-2 text-zinc-200">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {isOpen ? (
        <div className="space-y-3 border-t border-zinc-800/50 p-4 pt-3">
          <div className="space-y-3">
            <PreviewFrame label="Hlavní článek na úvodní stránce">
              <div className="relative aspect-21/9 overflow-hidden rounded-lg bg-zinc-900">
                <img
                  src={imageUrl}
                  alt="Náhled hlavního článku na úvodní stránce"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black via-black/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 space-y-2 p-4">
                  <div className="h-3 w-24 rounded-full bg-white/20" />
                  <div className="h-2 w-24 rounded-full bg-white/20" />
                  <div className="h-6 w-3/4 rounded-full bg-white/20" />
                  <div className="h-6 w-1/2 rounded-full bg-white/20" />
                  <div className="h-3 w-40 rounded-full bg-white/20" />
                </div>
              </div>
            </PreviewFrame>

            <div className="grid gap-3 lg:grid-cols-2">
              <PreviewFrame label="Detail článku">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-900">
                  <img
                    src={imageUrl}
                    alt="Náhled detailu článku"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 space-y-2 p-4">
                    <div className="h-2 w-24 rounded-full bg-white/20" />
                    <div className="h-5 w-3/4 rounded-full bg-white/20" />
                    <div className="h-5 w-1/2 rounded-full bg-white/20" />
                  </div>
                </div>
              </PreviewFrame>

              <PreviewFrame label="Karta článku v mřížce">
                <div className="overflow-hidden rounded-lg border border-zinc-700/80 bg-white/95">
                  <div className="aspect-16/10 w-full overflow-hidden bg-zinc-200">
                    <img
                      src={imageUrl}
                      alt="Náhled karty článku"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="space-y-3 p-3">
                    <div className="space-y-2">
                      <div className="h-4 w-11/12 rounded-full bg-zinc-800/90" />
                      <div className="h-4 w-8/12 rounded-full bg-zinc-800/75" />
                    </div>
                    <div className="h-3 w-6/12 rounded-full bg-zinc-400/70" />
                  </div>
                </div>
              </PreviewFrame>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function PreviewFrame({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Paragraph size="small" className="text-zinc-300">
        {label}
      </Paragraph>
      {children}
    </div>
  );
}

"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { Loader2, Upload, X, Link as LinkIcon } from "lucide-react";
import Button from "@/components/ui/dashboard/Button";
import { Paragraph } from "@/components/ui/dashboard/TextUtils";
import { Input } from "@/components/ui/dashboard/Inputs";
import { clsx } from "clsx";
import { useCampaignBannerUpload } from "../hooks/useCampaignBannerUpload";

/**
 * Pole pro banner kampaně: umožní nahrát obrázek do bucketu a uložit výslednou URL do formuláře.
 * Alternativně lze zadat URL ručně.
 * @param {Object} props - Props komponenty.
 * @param {string} props.value - Aktuální URL banner obrázku.
 * @param {(value: string) => void} props.onChange - Callback pro změnu URL.
 * @return {JSX.Element} UI pro nahrání/odebrání banneru kampaně.
 */
export function CampaignBannerField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputId = useId();
  const fileInputId = `${inputId}-file`;
  const [showUrlInput, setShowUrlInput] = useState(false);

  const { isDragging, isUploading, uploadError, setIsDragging, clearUploadError, handleUpload } =
    useCampaignBannerUpload({
      onUploaded: (url) => {
        onChange(url);
        clearUploadError();
      },
    });

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium tracking-tight text-white mb-1.5">
        Banner obrázek
      </label>

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
          <div className="flex min-h-44 flex-col items-center justify-center gap-3 px-6 py-8">
            <Loader2 size={24} className="animate-spin text-zinc-300" />
            <Paragraph>Nahrávám banner...</Paragraph>
          </div>
        ) : value ? (
          <div className="group relative">
            <Image
              src={value}
              alt="Banner kampaně"
              width={800}
              height={320}
              className="h-44 w-full object-cover"
              unoptimized
            />
            <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/70 via-black/10 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex gap-2">
                <label
                  htmlFor={fileInputId}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950/80 px-2 py-1 text-sm font-medium tracking-tight text-zinc-200 transition-colors hover:bg-zinc-900"
                >
                  <Upload size={16} />
                  Nahrát nový
                </label>
                <Button
                  variant="outline"
                  onClick={() => setShowUrlInput((current) => !current)}
                  className="bg-zinc-950/80"
                >
                  <LinkIcon size={16} />
                  URL
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  onChange("");
                  clearUploadError();
                }}
                className="bg-zinc-950/80 text-red-300 hover:text-red-200"
              >
                <X size={16} />
                Odebrat
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-44 flex-col items-center justify-center gap-3 px-6 py-6 text-center">
            <div className="rounded-full bg-zinc-800 p-3 text-zinc-300">
              <Upload size={20} />
            </div>
            <div className="space-y-1">
              <Paragraph textAlign="center" fontWeight="semibold" color="primary">
                Přetáhni obrázek sem nebo vyber soubor
              </Paragraph>
              <Paragraph textAlign="center" size="small" color="muted">
                Obrázek se nahraje do bucketu a URL se uloží do kampaně.
              </Paragraph>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <label
                htmlFor={fileInputId}
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium tracking-tight text-zinc-950 transition-colors hover:bg-zinc-200"
              >
                <Upload size={16} />
                Nahrát soubor
              </label>
              <Button variant="outline" onClick={() => setShowUrlInput(true)}>
                <LinkIcon size={16} />
                Zadat URL
              </Button>
            </div>
          </div>
        )}

        <input
          id={fileInputId}
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

      {showUrlInput ? (
        <div className="pt-1">
          <Input
            label="URL banner obrázku"
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://..."
            maxLength={1024}
          />
        </div>
      ) : null}

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
    </div>
  );
}


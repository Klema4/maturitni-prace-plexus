"use client";

import { useRef } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/app/components/blog/ui/Button";
import { Input } from "@/app/components/blog/ui/Inputs";
import { useCompanyAdsBannerUpload } from "@/app/features/ads/company-dashboard/hooks/useCompanyAdsBannerUpload";

type CampaignBannerFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function CampaignBannerField({
  value,
  onChange,
}: CampaignBannerFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const {
    isUploading,
    uploadError,
    clearUploadError,
    handleUpload,
  } = useCompanyAdsBannerUpload({
    onUploaded: onChange,
  });

  return (
    <div className="space-y-3 md:col-span-2">
      <div className="space-y-2">
        <label className="text-sm font-medium tracking-tight text-dark">
          Obrázek reklamy
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-black/10 bg-white"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {isUploading ? "Nahrávám obrázek..." : "Nahrát obrázek pro kampaň"}
          </Button>
          {value ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-zinc-600"
              onClick={() => {
                clearUploadError();
                onChange("");
              }}
            >
              <X size={16} />
              Odebrat
            </Button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            if (!event.target.files?.length) {
              return;
            }

            void handleUpload(event.target.files);
            event.target.value = "";
          }}
          disabled={isUploading}
        />
      </div>

      <Input
        label="Nebo vlož URL banneru"
        value={value}
        onChange={(event) => {
          clearUploadError();
          onChange(event.target.value);
        }}
        placeholder="https://..."
        variant="light"
      />

      {uploadError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium tracking-tight text-rose-700">
          {uploadError}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-black/6 bg-zinc-50/70">
        <div className="flex items-center justify-between border-b border-black/6 px-4 py-3">
          <div>
            <p className="text-sm font-semibold tracking-tight text-dark">
              Náhled banneru
            </p>
            <p className="text-xs font-medium tracking-tight text-zinc-500">
              Použije se přímo v kampani.
            </p>
          </div>
        </div>
        <div className="relative aspect-[16/7] w-full bg-[linear-gradient(135deg,_rgba(244,244,245,1),rgba(238,242,255,1))]">
          {value ? (
            <Image
              src={value}
              alt="Náhled obrázku reklamy"
              fill
              sizes="(max-width: 768px) 100vw, 720px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-zinc-400">
              <ImageIcon size={28} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { Input } from "@/components/ui/dashboard/Inputs";
import { Paragraph } from "@/components/ui/dashboard/TextUtils";
import Button from "@/components/ui/dashboard/Button";
import ImageSelectModal from "@/app/features/dashboard/articles/create/components/ImageSelectModal";

interface ImageBlockProps {
  content: {
    url: string;
    caption?: string;
  };
  onChange: (content: { url: string; caption?: string }) => void;
}

export default function ImageBlock({ content, onChange }: ImageBlockProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/20 p-2">
      {content.url ? (
        <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
          <img
            src={content.url}
            alt={content.caption || "Obrázek v článku"}
            className="max-h-[26rem] w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-8 text-center">
          <div className="rounded-full bg-zinc-800 p-3 text-zinc-300">
            <ImageIcon size={18} />
          </div>
          <div className="space-y-1">
            <Paragraph textAlign="center" color="primary">Obrázek v obsahu</Paragraph>
            <Paragraph textAlign="center" size="small" color="muted">
              Vyber obrázek z knihovny nebo vlož přímou URL adresu.
            </Paragraph>
          </div>
          <Button variant="outline" onClick={() => setIsModalOpen(true)}>
            <Upload size={16} />
            Vybrat obrázek
          </Button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setIsModalOpen(true)}>
          <ImageIcon size={16} />
          {content.url ? "Změnit obrázek" : "Vybrat z knihovny"}
        </Button>
        {content.url ? (
          <Button
            variant="outline"
            onClick={() => onChange({ url: "", caption: "" })}
            className="text-red-300 hover:text-red-200"
          >
            <X size={16} />
            Odebrat
          </Button>
        ) : null}
      </div>

      <Input
        label="URL obrázku"
        value={content.url}
        onChange={(event) =>
          onChange({ ...content, url: event.target.value })
        }
        placeholder="https://example.com/obrazek.jpg"
      />

      <Input
        label="Popisek obrázku"
        value={content.caption || ""}
        onChange={(event) =>
          onChange({ ...content, caption: event.target.value })
        }
        placeholder="Krátký popisek obrázku"
      />

      <ImageSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(selectedUrl) => {
          onChange({ ...content, url: selectedUrl });
          setIsModalOpen(false);
        }}
      />
    </div>
  );
}

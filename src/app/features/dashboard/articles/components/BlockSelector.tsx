"use client";

import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Code,
  Heading1,
  Image as ImageIcon,
  Info,
  Megaphone,
  Minus,
  Plus,
  Quote,
  Type,
  Youtube,
} from "lucide-react";
import { clsx } from "clsx";
import type { ArticleBlockType } from "@/app/features/dashboard/articles/content";

interface BlockSelectorProps {
  onSelect: (type: ArticleBlockType) => void;
  align?: "top" | "bottom";
}

interface BlockOption {
  type: ArticleBlockType;
  label: string;
  description: string;
  icon: LucideIcon;
}

const blockOptions: BlockOption[] = [
  {
    type: "text",
    label: "Text",
    description: "Běžný odstavec",
    icon: Type,
  },
  {
    type: "heading",
    label: "Nadpis",
    description: "Nadpis sekce",
    icon: Heading1,
  },
  {
    type: "ad",
    label: "Reklama",
    description: "Dynamická reklamní kampaň",
    icon: Megaphone,
  },
  {
    type: "image",
    label: "Obrázek",
    description: "Obrázek s popiskem",
    icon: ImageIcon,
  },
  {
    type: "quote",
    label: "Citace",
    description: "Zvýrazněný citát",
    icon: Quote,
  },
  {
    type: "code",
    label: "Kód",
    description: "Ukázka kódu",
    icon: Code,
  },
  {
    type: "callout",
    label: "Poznámka",
    description: "Tip nebo upozornění",
    icon: Info,
  },
  {
    type: "video",
    label: "Video",
    description: "Vložené YouTube video",
    icon: Youtube,
  },
  {
    type: "divider",
    label: "Oddělovač",
    description: "Vodorovná čára",
    icon: Minus,
  },
];

export function BlockSelector({
  onSelect,
  align = "bottom",
}: BlockSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div
      ref={containerRef}
      className={clsx("relative h-0", isOpen ? "z-50" : "z-10")}
    >
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={clsx(
          "absolute left-1/2 top-0 inline-flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 text-zinc-500 shadow-lg transition-colors hover:border-zinc-600 hover:text-zinc-200",
          isOpen && "border-zinc-600 text-zinc-200",
        )}
        aria-label="Přidat blok"
      >
        <Plus size={14} />
      </button>

      {isOpen ? (
        <div
          className={clsx(
            "absolute left-1/2 z-[60] w-[20rem] -translate-x-1/2 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-[0_18px_60px_rgba(0,0,0,0.45)]",
            align === "bottom" ? "bottom-5" : "top-5",
          )}
        >
          <div className="border-b border-zinc-800 px-3 py-2">
            <div className="text-[11px] font-medium tracking-tight text-zinc-500">
              Základní bloky
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto p-1.5">
            {blockOptions.map((option) => {
              const Icon = option.icon;

              return (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => {
                    onSelect(option.type);
                    setIsOpen(false);
                  }}
                  className="grid w-full grid-cols-[auto_1fr] items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-zinc-800"
                >
                  <div className="rounded-md bg-zinc-800/90 p-2 text-zinc-300">
                    <Icon size={14} />
                  </div>
                  <div className="space-y-0.5">
                    <div className="text-sm font-medium tracking-tight text-zinc-100">
                      {option.label}
                    </div>
                    <div className="text-[11px] leading-4 text-zinc-500">
                      {option.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

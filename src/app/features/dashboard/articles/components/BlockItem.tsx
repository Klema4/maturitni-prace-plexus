"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import type { ArticleBlock } from "@/app/features/dashboard/articles/content";
import AdBlock from "@/app/features/dashboard/articles/components/blocks/AdBlock";
import CalloutBlock from "@/app/features/dashboard/articles/components/blocks/CalloutBlock";
import CodeBlock from "@/app/features/dashboard/articles/components/blocks/CodeBlock";
import DividerBlock from "@/app/features/dashboard/articles/components/blocks/DividerBlock";
import ImageBlock from "@/app/features/dashboard/articles/components/blocks/ImageBlock";
import QuoteBlock from "@/app/features/dashboard/articles/components/blocks/QuoteBlock";
import TextBlock from "@/app/features/dashboard/articles/components/blocks/TextBlock";
import VideoBlock from "@/app/features/dashboard/articles/components/blocks/VideoBlock";

interface BlockItemProps {
  block: ArticleBlock;
  onUpdate: (content: ArticleBlock["content"]) => void;
  onRemove: () => void;
}

export function BlockItem({ block, onUpdate, onRemove }: BlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "p-1 group relative rounded-xl border border-transparent transition-colors",
        isDragging && "z-10 opacity-70",
        !isDragging && "hover:border-zinc-900 hover:bg-zinc-900/20",
      )}
    >
      <div className="pointer-events-none z-10 hidden items-center gap-1 rounded-lg border border-zinc-800/50 bg-zinc-800/10 p-1 opacity-0 shadow-lg transition-opacity group-hover:flex group-hover:opacity-100 lg:flex w-fit">
        <button
          type="button"
          className="cursor-pointer pointer-events-auto rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
          {...attributes}
          {...listeners}
          aria-label="Přesunout blok"
        >
          <GripVertical size={16} />
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="cursor-pointer pointer-events-auto rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-red-300"
          aria-label="Smazat blok"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="pt-2">{renderBlock(block, onUpdate)}</div>
    </div>
  );
}

function renderBlock(
  block: ArticleBlock,
  onUpdate: (content: ArticleBlock["content"]) => void,
) {
  switch (block.type) {
    case "text":
      return <TextBlock content={block.content} onChange={onUpdate} />;
    case "heading":
      return (
        <TextBlock content={block.content} isHeading onChange={onUpdate} />
      );
    case "ad":
      return <AdBlock />;
    case "image":
      return <ImageBlock content={block.content} onChange={onUpdate} />;
    case "divider":
      return <DividerBlock />;
    case "quote":
      return <QuoteBlock content={block.content} onChange={onUpdate} />;
    case "code":
      return <CodeBlock content={block.content} onChange={onUpdate} />;
    case "callout":
      return <CalloutBlock content={block.content} onChange={onUpdate} />;
    case "video":
      return <VideoBlock content={block.content} onChange={onUpdate} />;
  }
}

"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { GripVertical } from "lucide-react";
import {
  createEmptyArticleBlock,
  normalizeArticleEditorContent,
  type ArticleBlock,
  type ArticleBlockType,
} from "@/app/features/dashboard/articles/content";
import { BlockItem } from "@/app/features/dashboard/articles/components/BlockItem";
import { BlockSelector } from "@/app/features/dashboard/articles/components/BlockSelector";

interface BlockEditorProps {
  content: ArticleBlock[];
  onChange: (content: ArticleBlock[]) => void;
}

export default function BlockEditor({ content, onChange }: BlockEditorProps) {
  const [blocks, setBlocks] = useState<ArticleBlock[]>(
    normalizeArticleEditorContent(content),
  );

  useEffect(() => {
    setBlocks(normalizeArticleEditorContent(content));
  }, [content]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function updateBlocks(nextBlocks: ArticleBlock[]) {
    setBlocks(nextBlocks);
    onChange(nextBlocks);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = blocks.findIndex((block) => block.id === active.id);
    const newIndex = blocks.findIndex((block) => block.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    updateBlocks(arrayMove(blocks, oldIndex, newIndex));
  }

  function addBlock(type: ArticleBlockType, index?: number) {
    const nextBlocks = [...blocks];
    const newBlock = createEmptyArticleBlock(type);

    if (typeof index === "number") {
      nextBlocks.splice(index + 1, 0, newBlock);
    } else {
      nextBlocks.push(newBlock);
    }

    updateBlocks(nextBlocks);
  }

  function updateBlock(blockId: string, nextContent: ArticleBlock["content"]) {
    updateBlocks(
      blocks.map((block) =>
        block.id === blockId ? { ...block, content: nextContent } : block,
      ) as ArticleBlock[],
    );
  }

  function removeBlock(blockId: string) {
    const filteredBlocks = blocks.filter((block) => block.id !== blockId);
    updateBlocks(
      filteredBlocks.length > 0
        ? filteredBlocks
        : [createEmptyArticleBlock("text")],
    );
  }

  return (
      <div className="space-y-4">

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((block) => block.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-10">
            {blocks.map((block, index) => (
              <div key={block.id} className="space-y-5">
                <BlockItem
                  block={block}
                  onUpdate={(nextContent) => updateBlock(block.id, nextContent)}
                  onRemove={() => removeBlock(block.id)}
                />
                <BlockSelector align="bottom" onSelect={(type) => addBlock(type, index)} />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

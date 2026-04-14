"use client";

import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import Button from "@/components/ui/dashboard/Button";
import { Input } from "@/components/ui/dashboard/Inputs";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/dashboard/Modal";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { clsx } from "clsx";
import type { ArticleTag } from "@/app/features/dashboard/articles/types";

interface TagSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: ArticleTag[];
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
}

export default function TagSelectionModal({
  isOpen,
  onClose,
  tags,
  selectedTagIds,
  onToggleTag,
}: TagSelectionModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTags = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return tags;
    }

    return tags.filter((tag) => {
      const haystack = `${tag.name} ${tag.description || ""}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [searchQuery, tags]);

  const selectedCount = selectedTagIds.length;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalHeader onClose={onClose}>Spravovat štítky</ModalHeader>

      <ModalBody className="space-y-4">
        <div className="space-y-1">
          <Paragraph size="small" color="muted">
            Vyhledávej a vyber štítky, pod kterými se článek zobrazí.
          </Paragraph>
          <Paragraph size="small" className="text-zinc-300">
            Vybráno: {selectedCount}
          </Paragraph>
        </div>

        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
          />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Hledat štítek"
            className="pl-10"
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-zinc-800">
          <div className="max-h-[24rem] overflow-y-auto bg-zinc-950/40 p-2">
            {filteredTags.length > 0 ? (
              <div className="space-y-1">
                {filteredTags.map((tag) => {
                  const isSelected = selectedTagIds.includes(tag.id);

                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => onToggleTag(tag.id)}
                      className="flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-zinc-900"
                    >
                      <span
                        className={clsx(
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors",
                          isSelected
                            ? "border-white bg-white text-zinc-950"
                            : "border-zinc-700 bg-zinc-900 text-transparent",
                        )}
                        aria-hidden="true"
                      >
                        <Check size={13} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium tracking-tight text-zinc-100">
                          {tag.name}
                        </span>
                        {tag.description ? (
                          <span className="block text-xs tracking-tight text-zinc-500">
                            {tag.description}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="px-3 py-6 text-center">
                <Paragraph size="small" color="muted">
                  Žádný štítek neodpovídá hledání.
                </Paragraph>
              </div>
            )}
          </div>
        </div>

        {selectedCount > 0 ? (
          <div className="space-y-2">
            <Heading variant="h6">Vybrané štítky</Heading>
            <div className="flex flex-wrap gap-2">
              {tags
                .filter((tag) => selectedTagIds.includes(tag.id))
                .map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => onToggleTag(tag.id)}
                    className="cursor-pointer rounded-full border border-white bg-white px-3 py-1.5 text-xs font-medium tracking-tight text-zinc-950 transition-colors hover:bg-zinc-200"
                  >
                    {tag.name}
                  </button>
                ))}
            </div>
          </div>
        ) : null}
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Hotovo
        </Button>
      </ModalFooter>
    </Modal>
  );
}

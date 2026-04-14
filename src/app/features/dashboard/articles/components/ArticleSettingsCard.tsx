"use client";

import { useId, useState } from "react";
import { Card } from "@/components/ui/dashboard/Card";
import { Input, Toggle } from "@/components/ui/dashboard/Inputs";
import Button from "@/components/ui/dashboard/Button";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import type { ArticleStatus, ArticleTag } from "@/app/features/dashboard/articles/types";
import TagSelectionModal from "@/app/features/dashboard/articles/components/TagSelectionModal";
import type { DashboardUser } from "@/app/features/dashboard/users/types";

interface ArticleSettingsCardProps {
  authors?: DashboardUser[];
  authorId?: string;
  status: ArticleStatus;
  slug: string;
  tags: ArticleTag[];
  selectedTagIds: string[];
  ratingEnabled: boolean;
  commentsEnabled: boolean;
  premiumOnly: boolean;
  onAuthorChange?: (authorId: string) => void;
  onStatusChange: (status: ArticleStatus) => void;
  onSlugChange: (slug: string) => void;
  onSlugBlur: () => void;
  onToggleTag: (tagId: string) => void;
  onRatingChange: (checked: boolean) => void;
  onCommentsChange: (checked: boolean) => void;
  onPremiumChange: (checked: boolean) => void;
}

export default function ArticleSettingsCard({
  authors = [],
  authorId,
  status,
  slug,
  tags,
  selectedTagIds,
  ratingEnabled,
  commentsEnabled,
  premiumOnly,
  onAuthorChange,
  onStatusChange,
  onSlugChange,
  onSlugBlur,
  onToggleTag,
  onRatingChange,
  onCommentsChange,
  onPremiumChange,
}: ArticleSettingsCardProps) {
  const authorSelectId = useId();
  const statusId = useId();
  const [isTagsModalOpen, setIsTagsModalOpen] = useState(false);
  const selectedTags = tags.filter((tag) => selectedTagIds.includes(tag.id));

  return (
    <>
      <Card className="space-y-5">
        <div className="space-y-1">
          <Heading variant="h4">Nastavení článku</Heading>
          <Paragraph size="small" color="muted">
            Publikace, dostupnost a štítky.
          </Paragraph>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor={authorSelectId}
              className="block text-sm font-medium tracking-tight text-white"
            >
              Autor
            </label>
            <select
              id={authorSelectId}
              value={authorId ?? ""}
              onChange={(event) => onAuthorChange?.(event.target.value)}
              className="w-full rounded-md border border-zinc-700/50 bg-zinc-800/75 px-3 py-2.5 text-sm font-medium tracking-tight text-white focus:outline-none focus:ring-2 focus:ring-white/75"
              disabled={!onAuthorChange || authors.length === 0}
            >
              <option value="" disabled>
                {authors.length > 0 ? "Vyber autora" : "Načítám autory..."}
              </option>
              {authors.map((author) => (
                <option key={author.id} value={author.id}>
                  {author.name} {author.surname}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor={statusId}
              className="block text-sm font-medium tracking-tight text-white"
            >
              Stav
            </label>
            <select
              id={statusId}
              value={status}
              onChange={(event) =>
                onStatusChange(event.target.value as ArticleStatus)
              }
              className="w-full rounded-md border border-zinc-700/50 bg-zinc-800/75 px-3 py-2.5 text-sm font-medium tracking-tight text-white focus:outline-none focus:ring-2 focus:ring-white/75"
            >
              <option value="draft">Koncept</option>
              <option value="need_factcheck">Potřebuje fact-check</option>
              <option value="need_read">Potřebuje korekturu</option>
              <option value="published">Publikováno</option>
            </select>
          </div>

          <Input
            label="URL slug"
            value={slug}
            onChange={(event) => onSlugChange(event.target.value)}
            onBlur={onSlugBlur}
            placeholder="url-slug"
          />
        </div>

        <div className="space-y-1 border-t border-zinc-800/75 pt-4">
          <Toggle
            label="Hodnocení"
            description="Zobrazí čtenářům hodnocení článku."
            checked={ratingEnabled}
            onChange={(event) => onRatingChange(event.target.checked)}
          />
          <Toggle
            label="Komentáře"
            description="Povolí diskusi pod článkem."
            checked={commentsEnabled}
            onChange={(event) => onCommentsChange(event.target.checked)}
          />
          <Toggle
            label="Pouze pro předplatitele"
            description="Obsah bude viditelný jen pro předplatitele."
            checked={premiumOnly}
            onChange={(event) => onPremiumChange(event.target.checked)}
          />
        </div>

        <div className="space-y-3 border-t border-zinc-800/75 pt-4">
          <div className="space-y-1">
            <Heading variant="h6">Štítky</Heading>
          </div>

          {selectedTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag.id}
                  className="rounded-full border border-white bg-white px-3 py-1.5 text-xs font-medium tracking-tight text-zinc-950"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          ) : (
            <Paragraph size="small" color="muted">
              Zatím nejsou vybrané žádné štítky.
            </Paragraph>
          )}

          <div>
            <Button variant="outline" onClick={() => setIsTagsModalOpen(true)}>
              Spravovat štítky
            </Button>
          </div>
        </div>
      </Card>

      <TagSelectionModal
        isOpen={isTagsModalOpen}
        onClose={() => setIsTagsModalOpen(false)}
        tags={tags}
        selectedTagIds={selectedTagIds}
        onToggleTag={onToggleTag}
      />
    </>
  );
}

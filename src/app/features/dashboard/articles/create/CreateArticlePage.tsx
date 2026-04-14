"use client";

import { Eye, Save } from "lucide-react";
import Button from "@/components/ui/dashboard/Button";
import QuickOptions from "@/components/ui/dashboard/QuickOptions";
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/dashboard/Modal";
import { Heading, Paragraph } from "@/components/ui/dashboard/TextUtils";
import { normalizeSlug } from "@/lib/utils/slug";
import ArticleCoverField from "@/app/features/dashboard/articles/components/ArticleCoverField";
import BlockEditor from "@/app/features/dashboard/articles/components/BlockEditor";
import ArticleMetaFields from "@/app/features/dashboard/articles/components/ArticleMetaFields";
import ArticleSettingsCard from "@/app/features/dashboard/articles/components/ArticleSettingsCard";
import { useCreateArticlePage } from "@/app/features/dashboard/articles/create/hooks/useCreateArticlePage";

export default function CreateArticlePage() {
  const {
    title,
    description,
    keywords,
    status,
    slug,
    imageUrl,
    authorId,
    authors,
    ratingEnabled,
    commentsEnabled,
    premiumOnly,
    tags,
    selectedTagIds,
    editorContent,
    isSaving,
    actionError,
    setTitle,
    setDescription,
    setKeywords,
    setStatus,
    setSlug,
    setImageUrl,
    setAuthorId,
    setRatingEnabled,
    setCommentsEnabled,
    setPremiumOnly,
    setEditorContent,
    setActionError,
    toggleTag,
    handleSave,
    handlePreview,
  } = useCreateArticlePage();

  return (
    <>
      <header>
        <Heading variant="h1">Nový článek</Heading>
        <Paragraph>Vytvoř a připrav článek k publikaci.</Paragraph>
      </header>

      <QuickOptions
        options={[
          {
            label: "Uložit",
            variant: "primary",
            icon: Save,
            onClick: () => {
              void handleSave();
            },
            disabled: isSaving,
          },
          {
            label: "Náhled",
            variant: "outline",
            icon: Eye,
            onClick: () => {
              void handlePreview();
            },
            disabled: isSaving,
          },
        ]}
      />

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(320px,0.95fr)]">
        <div className="space-y-4">
          <section className="px-1 pb-2">
            <ArticleCoverField value={imageUrl} onChange={setImageUrl} />
          </section>

          <section className="space-y-4 px-1 py-2">
            <ArticleMetaFields
              title={title}
              description={description}
              keywords={keywords}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
              onKeywordsChange={setKeywords}
            />
          </section>

          <section className="border-t border-zinc-800/80 px-1 pt-6">
            <BlockEditor
              content={editorContent}
              onChange={setEditorContent}
            />
          </section>
        </div>

        <div className="space-y-4">
          <ArticleSettingsCard
            authors={authors}
            authorId={authorId ?? undefined}
            onAuthorChange={setAuthorId}
            status={status}
            slug={slug}
            tags={tags}
            selectedTagIds={selectedTagIds}
            ratingEnabled={ratingEnabled}
            commentsEnabled={commentsEnabled}
            premiumOnly={premiumOnly}
            onStatusChange={setStatus}
            onSlugChange={setSlug}
            onSlugBlur={() => setSlug(normalizeSlug(slug))}
            onToggleTag={toggleTag}
            onRatingChange={setRatingEnabled}
            onCommentsChange={setCommentsEnabled}
            onPremiumChange={setPremiumOnly}
          />
        </div>
      </section>

      <Modal
        isOpen={actionError !== null}
        onClose={() => setActionError(null)}
        size="sm"
      >
        <ModalHeader onClose={() => setActionError(null)}>Chyba</ModalHeader>
        <ModalBody>
          <Paragraph className="text-red-400">{actionError}</Paragraph>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setActionError(null)}>
            Zavřít
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

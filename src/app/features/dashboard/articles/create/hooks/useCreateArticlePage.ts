"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeSlug } from "@/lib/utils/slug";
import { apiFetchOrThrow } from "@/lib/utils/api";
import {
  createDashboardArticle,
  listDashboardArticleTags,
} from "@/app/features/dashboard/articles/api/articles.api";
import { normalizeArticleEditorContent } from "@/app/features/dashboard/articles/content";
import type {
  ArticleBlock,
  ArticleStatus,
  ArticleTag,
} from "@/app/features/dashboard/articles/types";
import { listDashboardUsers } from "@/app/features/dashboard/users/api/users.api";
import type { DashboardUser } from "@/app/features/dashboard/users/types";

function parseKeywordsInput(input: string) {
  return Array.from(
    new Set(
      input
        .split(",")
        .map((keyword) => keyword.trim().replace(/\s+/g, " "))
        .filter(Boolean),
    ),
  );
}

/**
 * Načte ID aktuálního přihlášeného uživatele (dashboard session).
 * @returns {Promise<string | null>} User ID nebo null, pokud není dostupné.
 */
async function getCurrentUserId(): Promise<string | null> {
  try {
    const response = await apiFetchOrThrow("/api/user/me");
    const json = (await response.json()) as { user?: { id?: string } };
    return json.user?.id ?? null;
  } catch {
    return null;
  }
}

export function useCreateArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [keywords, setKeywords] = useState("");
  const [status, setStatus] = useState<ArticleStatus>("draft");
  const [slug, setSlug] = useState("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [authors, setAuthors] = useState<DashboardUser[]>([]);
  const [authorId, setAuthorId] = useState<string | null>(null);
  const [ratingEnabled, setRatingEnabled] = useState(true);
  const [commentsEnabled, setCommentsEnabled] = useState(true);
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [tags, setTags] = useState<ArticleTag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [editorContent, setEditorContent] = useState<ArticleBlock[]>(
    normalizeArticleEditorContent(null),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [tagsData, usersData, currentUserId] = await Promise.all([
          listDashboardArticleTags(),
          listDashboardUsers(),
          getCurrentUserId(),
        ]);
        setTags(tagsData);
        setAuthors(usersData);

        if (currentUserId) {
          setAuthorId(currentUserId);
        } else if (usersData.length > 0) {
          setAuthorId(usersData[0]?.id ?? null);
        }
      } catch (loadError) {
        console.error("Error fetching create article data:", loadError);
      }
    }

    void fetchInitialData();
  }, []);

  const toggleTag = useCallback((tagId: string) => {
    setSelectedTagIds((current) =>
      current.includes(tagId)
        ? current.filter((id) => id !== tagId)
        : [...current, tagId],
    );
  }, []);

  const handleTitleChange = useCallback(
    (nextTitle: string) => {
      setTitle(nextTitle);

      if (!isSlugManuallyEdited) {
        setSlug(normalizeSlug(nextTitle));
      }
    },
    [isSlugManuallyEdited],
  );

  const handleSlugChange = useCallback(
    (nextSlug: string) => {
      setSlug(nextSlug);
      setIsSlugManuallyEdited(
        normalizeSlug(nextSlug) !== normalizeSlug(title),
      );
    },
    [title],
  );

  const handleSave = useCallback(async () => {
    const trimmedTitle = title.trim();
    const normalizedArticleSlug = normalizeSlug(slug);

    if (!trimmedTitle || !normalizedArticleSlug) {
      setActionError("Název článku a slug jsou povinné.");
      return;
    }

    try {
      setActionError(null);
      setIsSaving(true);

      await createDashboardArticle({
        title: trimmedTitle,
        description: description.trim() || undefined,
        slug: normalizedArticleSlug,
        imageUrl: imageUrl.trim() || undefined,
        content: editorContent,
        authorId: authorId ?? undefined,
        status,
        ratingEnabled,
        commentsEnabled,
        premiumOnly,
        tagIds: selectedTagIds,
        keywords: parseKeywordsInput(keywords),
      });

      router.push("/dashboard/articles");
    } catch (saveError) {
      setActionError(
        saveError instanceof Error
          ? saveError.message
          : "Nepodařilo se uložit článek.",
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    commentsEnabled,
    description,
    editorContent,
    imageUrl,
    keywords,
    premiumOnly,
    ratingEnabled,
    router,
    selectedTagIds,
    slug,
    status,
    title,
  ]);

  const handlePreview = useCallback(async () => {
    const trimmedTitle = title.trim();
    const normalizedArticleSlug = normalizeSlug(slug);

    if (!trimmedTitle || !normalizedArticleSlug) {
      setActionError("Nejdřív doplň název článku a slug pro náhled.");
      return;
    }

    const previewWindow =
      typeof window !== "undefined" ? window.open("", "_blank") : null;

    try {
      setActionError(null);
      setIsSaving(true);
      setSlug(normalizedArticleSlug);

      const article = await createDashboardArticle({
        title: trimmedTitle,
        description: description.trim() || undefined,
        slug: normalizedArticleSlug,
        imageUrl: imageUrl.trim() || undefined,
        content: editorContent,
        authorId: authorId ?? undefined,
        status: "draft",
        ratingEnabled,
        commentsEnabled,
        premiumOnly,
        tagIds: selectedTagIds,
        keywords: parseKeywordsInput(keywords),
      });

      const previewUrl = `/preview/articles/${article.id}`;

      if (previewWindow) {
        previewWindow.location.replace(previewUrl);
      } else if (typeof window !== "undefined") {
        window.open(previewUrl, "_blank", "noopener,noreferrer");
      }

      router.replace(`/dashboard/articles/${article.id}/edit`);
    } catch (previewError) {
      if (previewWindow && !previewWindow.closed) {
        previewWindow.close();
      }

      setActionError(
        previewError instanceof Error
          ? previewError.message
          : "Nepodařilo se připravit náhled článku.",
      );
    } finally {
      setIsSaving(false);
    }
  }, [
    authorId,
    commentsEnabled,
    description,
    editorContent,
    imageUrl,
    keywords,
    premiumOnly,
    ratingEnabled,
    router,
    selectedTagIds,
    slug,
    title,
  ]);

  return {
    title,
    description,
    keywords,
    status,
    slug,
    imageUrl,
    authors,
    authorId,
    ratingEnabled,
    commentsEnabled,
    premiumOnly,
    tags,
    selectedTagIds,
    editorContent,
    isSaving,
    actionError,
    setTitle: handleTitleChange,
    setDescription,
    setKeywords,
    setStatus,
    setSlug: handleSlugChange,
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
  };
}

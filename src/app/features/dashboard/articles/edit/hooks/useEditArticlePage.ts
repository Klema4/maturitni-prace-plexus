"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeSlug } from "@/lib/utils/slug";
import { apiFetchOrThrow } from "@/lib/utils/api";
import {
  getDashboardArticle,
  listDashboardArticleTags,
  updateDashboardArticle,
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

export function useEditArticlePage(articleId: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
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

  useEffect(() => {
    async function fetchArticle() {
      try {
        setLoading(true);
        setError(null);

        const [article, articleTags, usersData, currentUserId] = await Promise.all([
          getDashboardArticle(articleId),
          listDashboardArticleTags(),
          listDashboardUsers(),
          getCurrentUserId(),
        ]);

        setTitle(article.title);
        setDescription(article.description || "");
        setKeywords((article.keywords ?? []).map((keyword) => keyword.name).join(", "));
        setStatus(article.status);
        setSlug(article.slug);
        setIsSlugManuallyEdited(
          normalizeSlug(article.slug) !== normalizeSlug(article.title),
        );
        setImageUrl(article.imageUrl || "");
        setRatingEnabled(article.ratingEnabled);
        setCommentsEnabled(article.commentsEnabled);
        setPremiumOnly(article.premiumOnly);
        setSelectedTagIds(article.tags.map((tag) => tag.id));
        setTags(articleTags || []);
        setAuthors(usersData);
        setAuthorId(article.author?.id ?? currentUserId ?? null);

        const normalizedContent = normalizeArticleEditorContent(article.content);
        setEditorContent(normalizedContent);
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : "Nastala chyba";
        setError(
          message.toLowerCase().includes("nenalezen")
            ? "Článek nenalezen"
            : message,
        );
      } finally {
        setLoading(false);
      }
    }

    if (articleId) {
      void fetchArticle();
    }
  }, [articleId]);

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
    const normalizedArticleSlug = normalizeSlug(slug);
    const normalizedImageUrl = imageUrl.trim() || undefined;

    if (!title.trim() || !normalizedArticleSlug) {
      setActionError("Název a slug jsou povinné");
      return;
    }

    try {
      setActionError(null);
      setSaving(true);
      await updateDashboardArticle(articleId, {
        title,
        description: description || undefined,
        slug: normalizedArticleSlug,
        imageUrl: normalizedImageUrl,
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
          : "Nastala chyba při ukládání",
      );
    } finally {
      setSaving(false);
    }
  }, [
    articleId,
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
    status,
    title,
  ]);

  const goBack = useCallback(() => {
    router.push("/dashboard/articles");
  }, [router]);

  const handlePreview = useCallback(async () => {
    const normalizedArticleSlug = normalizeSlug(slug);
    const normalizedImageUrl = imageUrl.trim() || undefined;

    if (!title.trim() || !normalizedArticleSlug) {
      setActionError("Nejdřív doplň název článku a slug pro náhled.");
      return;
    }

    const previewWindow =
      typeof window !== "undefined" ? window.open("", "_blank") : null;

    try {
      setActionError(null);
      setSaving(true);

      await updateDashboardArticle(articleId, {
        title,
        description: description || undefined,
        slug: normalizedArticleSlug,
        imageUrl: normalizedImageUrl,
        content: editorContent,
        authorId: authorId ?? undefined,
        status,
        ratingEnabled,
        commentsEnabled,
        premiumOnly,
        tagIds: selectedTagIds,
        keywords: parseKeywordsInput(keywords),
      });

      const previewUrl = `/preview/articles/${articleId}`;

      if (previewWindow) {
        previewWindow.location.replace(previewUrl);
      } else if (typeof window !== "undefined") {
        window.open(previewUrl, "_blank", "noopener,noreferrer");
      }
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
      setSaving(false);
    }
  }, [
    articleId,
    authorId,
    commentsEnabled,
    description,
    editorContent,
    imageUrl,
    keywords,
    premiumOnly,
    ratingEnabled,
    selectedTagIds,
    slug,
    status,
    title,
  ]);

  return {
    loading,
    saving,
    error,
    actionError,
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
    goBack,
  };
}

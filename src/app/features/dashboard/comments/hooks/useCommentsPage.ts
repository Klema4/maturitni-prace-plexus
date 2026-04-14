"use client";

import { useCallback, useEffect, useState } from "react";
import {
  banCommentAuthor,
  deleteComment,
  editCommentAsAdmin,
  listDashboardComments,
  hideComment,
  unhideComment,
} from "../api/comments.api";
import type { DashboardComment } from "../types";
import { useLocalStorageState } from "@/lib/hooks/useLocalStorageState";

export function useCommentsPage() {
  const [comments, setComments] = useState<DashboardComment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [perPage, setPerPage] = useLocalStorageState<number>(
    "dashboard.comments.perPage",
    50,
  );
  const [page, setPage] = useState(1);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const safePerPage =
        Number.isFinite(perPage) && perPage > 0 ? Math.min(Math.floor(perPage), 200) : 50;
      const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
      const offset = (safePage - 1) * safePerPage;

      const { items, total: nextTotal } = await listDashboardComments({
        limit: safePerPage,
        offset,
        query,
      });
      setComments(items);
      setTotal(nextTotal);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Nastala chyba");
    } finally {
      setLoading(false);
    }
  }, [page, perPage, query]);

  useEffect(() => {
    void fetchComments();
  }, [fetchComments]);

  useEffect(() => {
    setPage(1);
  }, [query, perPage]);

  const handleHide = useCallback(
    async (commentId: string, reason: string) => {
      await hideComment(commentId, reason);
      await fetchComments();
    },
    [fetchComments],
  );

  const handleUnhide = useCallback(
    async (commentId: string) => {
      await unhideComment(commentId);
      await fetchComments();
    },
    [fetchComments],
  );

  const handleBanUser = useCallback(
    async (userId: string) => {
      await banCommentAuthor(userId);
      await fetchComments();
    },
    [fetchComments],
  );

  const handleEditAsAdmin = useCallback(
    async (commentId: string, newContent: string) => {
      await editCommentAsAdmin(commentId, newContent);
      await fetchComments();
    },
    [fetchComments],
  );

  const handleDelete = useCallback(
    async (commentId: string) => {
      await deleteComment(commentId);
      await fetchComments();
    },
    [fetchComments],
  );

  const safePerPage =
    Number.isFinite(perPage) && perPage > 0 ? Math.min(Math.floor(perPage), 200) : 50;
  const totalPages = Math.max(1, Math.ceil(total / safePerPage));
  const clampedPage = Math.min(Math.max(1, page), totalPages);

  useEffect(() => {
    if (clampedPage !== page) {
      setPage(clampedPage);
    }
  }, [clampedPage, page]);

  return {
    comments,
    total,
    loading,
    error,
    query,
    setQuery,
    page: clampedPage,
    setPage,
    perPage: safePerPage,
    setPerPage,
    totalPages,
    handleHide,
    handleUnhide,
    handleBanUser,
    handleEditAsAdmin,
    handleDelete,
  };
}

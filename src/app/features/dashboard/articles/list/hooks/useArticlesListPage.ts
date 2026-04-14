"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  deleteDashboardArticle,
  listDashboardArticles,
} from "@/app/features/dashboard/articles/api/articles.api";
import type { DashboardArticle } from "@/app/features/dashboard/articles/types";

export function useArticlesListPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<DashboardArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticles() {
      try {
        setLoading(true);
        setError(null);
        setArticles(await listDashboardArticles());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Nastala chyba");
      } finally {
        setLoading(false);
      }
    }

    void fetchArticles();
  }, []);

  const handleDelete = useCallback(async (articleId: string) => {
    if (!confirm("Opravdu chcete smazat tento článek?")) {
      return;
    }

    try {
      await deleteDashboardArticle(articleId);
      setArticles((current) =>
        current.filter((article) => article.id !== articleId),
      );
    } catch (deleteError) {
      alert(
        deleteError instanceof Error ? deleteError.message : "Nastala chyba",
      );
    }
  }, []);

  const openEdit = useCallback(
    (articleId: string) => {
      router.push(`/dashboard/articles/${articleId}/edit`);
    },
    [router],
  );

  return {
    articles,
    loading,
    error,
    handleDelete,
    openEdit,
  };
}

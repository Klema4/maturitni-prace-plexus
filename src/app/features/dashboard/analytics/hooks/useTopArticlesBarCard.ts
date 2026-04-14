"use client";

import { useEffect, useState } from "react";
import { getAnalyticsTopArticles } from "../api/analytics.api";
import type { TopArticleRow } from "../types";

export function useTopArticlesBarCard() {
  const [data, setData] = useState<TopArticleRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        setData(await getAnalyticsTopArticles());
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Chyba při načítání",
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchTopArticles();
  }, []);

  return {
    data,
    loading,
    error,
  };
}

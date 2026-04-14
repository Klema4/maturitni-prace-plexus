"use client";

import { useEffect, useState } from "react";
import { getAnalyticsStats } from "../api/analytics.api";
import type { AnalyticsStats } from "../types";

export function useAnalyticsPage() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        setError(null);
        setStats(await getAnalyticsStats());
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Nastala chyba");
      } finally {
        setLoading(false);
      }
    }

    void fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
  };
}

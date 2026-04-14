"use client";

import { useCallback, useEffect, useState } from "react";
import { getOverviewStats } from "../api/overview.api";
import type { OverviewStats } from "../types";

export function useOverviewPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setStats(await getOverviewStats());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Nastala chyba");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
  };
}

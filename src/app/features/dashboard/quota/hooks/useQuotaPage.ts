"use client";

import { useEffect, useMemo, useState } from "react";
import { getDashboardQuotaData } from "../api/quota.api";
import type { UserFile, UserProfile, UserStorageStats } from "../types";

/**
 * Fallback kvóta (2GB), pokud ji API ještě nevrací.
 */
const DEFAULT_QUOTA_LIMIT_BYTES = 2 * 1024 * 1024 * 1024;

export function useQuotaPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStorageStats>({
    totalFiles: 0,
    totalSize: 0,
  });
  const [files, setFiles] = useState<UserFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuotaData() {
      try {
        setLoading(true);
        setError(null);

        const data = await getDashboardQuotaData();
        setProfile(data.profile);
        setStats(data.stats);
        setFiles(data.files);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Nastala chyba");
      } finally {
        setLoading(false);
      }
    }

    void fetchQuotaData();
  }, []);

  const computed = useMemo(() => {
    const usedBytes = Math.max(0, stats.totalSize);
    const quotaLimitBytes =
      typeof profile?.maxStorageBytes === "number"
        ? profile.maxStorageBytes
        : DEFAULT_QUOTA_LIMIT_BYTES;
    const safeQuotaLimit = Math.max(0, quotaLimitBytes);
    const remainingBytes = Math.max(0, safeQuotaLimit - usedBytes);
    const usagePercent =
      safeQuotaLimit === 0 ? 100 : Math.min(100, (usedBytes / safeQuotaLimit) * 100);
    const usagePercentRounded = Math.round(usagePercent);
    const latestUpload = files[0]?.uploadedAt;

    return {
      quotaLimitBytes: safeQuotaLimit,
      usedBytes,
      remainingBytes,
      usagePercent,
      usagePercentRounded,
      latestUpload,
    };
  }, [files, profile?.maxStorageBytes, stats.totalSize]);

  return {
    profile,
    stats,
    files,
    loading,
    error,
    ...computed,
  };
}

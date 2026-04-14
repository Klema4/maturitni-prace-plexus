import { apiFetchOrThrow } from "@/lib/utils/api";
import type { DashboardQuotaData, UserFile } from "../types";

export async function getDashboardQuotaData(): Promise<DashboardQuotaData> {
  const [userRes, statsRes, filesRes] = await Promise.all([
    apiFetchOrThrow("/api/user/me"),
    apiFetchOrThrow("/api/dashboard/storage?userStats=true"),
    apiFetchOrThrow("/api/dashboard/storage?mine=true"),
  ]);

  const [userJson, statsJson, filesJson] = await Promise.all([
    userRes.json(),
    statsRes.json(),
    filesRes.json(),
  ]);

  return {
    profile: userJson?.user ?? null,
    stats: {
      totalFiles: Number(statsJson?.stats?.totalFiles) || 0,
      totalSize: Number(statsJson?.stats?.totalSize) || 0,
    },
    files: (filesJson?.files ?? []) as UserFile[],
  };
}

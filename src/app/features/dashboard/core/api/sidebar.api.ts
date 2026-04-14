import { apiFetchOrThrow } from "@/lib/utils/api";

export async function getSidebarProfileData() {
  const [userRes, storageRes] = await Promise.all([
    apiFetchOrThrow("/api/user/me"),
    apiFetchOrThrow("/api/dashboard/storage?userStats=true"),
  ]);

  const [userJson, storageJson] = await Promise.all([
    userRes.json(),
    storageRes.json(),
  ]);

  const user = userJson?.user;

  return {
    profile: user
      ? {
          name: user.name ?? "",
          surname: user.surname ?? "",
          image: user.image ?? null,
          maxStorageBytes:
            typeof user.maxStorageBytes === "number" ? user.maxStorageBytes : null,
        }
      : null,
    usedStorageBytes: Number(storageJson?.stats?.totalSize) || 0,
  };
}

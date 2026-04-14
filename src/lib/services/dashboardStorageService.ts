import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import {
  createFile,
  createFolder,
  deleteFile,
  deleteFolder,
  getAllFiles,
  getAllFolders,
  getFileById,
  getFilesByFolderId,
  getFilesByUserId,
  getStorageStats,
  getStorageStatsByUserId,
  updateFile,
  updateFolder,
} from "@/lib/repositories/storageRepository";
import { getUserById } from "@/lib/repositories/userRepository";
import {
  CreateFolderSchema,
  CreateStorageFileSchema,
  UpdateFolderSchema,
  UpdateStorageFileSchema,
} from "@/lib/schemas/storageSchema";

/**
 * Výchozí kvóta uživatele (fallback), pokud není dostupná z DB.
 */
const DEFAULT_USER_STORAGE_QUOTA_BYTES = 2 * 1024 * 1024 * 1024;

/**
 * Maximální velikost souboru při importu z URL (kopíruje limit uploaderu).
 */
const MAX_IMPORTED_FILE_BYTES = 50 * 1024 * 1024;

/**
 * Ověří, že URL je http/https a vrátí instanci URL.
 * @param {string} input - URL zadané uživatelem.
 * @returns {URL} Normalizovaná URL instance.
 */
function parseHttpUrl(input: string): URL {
  const url = new URL(input);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("URL musí začínat na http:// nebo https://");
  }
  return url;
}

/**
 * Sanitizuje název souboru pro bezpečné uložení.
 * @param {string} fileName - Původní název.
 * @returns {string} Sanitizovaný název.
 */
function sanitizeFileName(fileName: string): string {
  const trimmed = fileName.trim();
  const collapsed = trimmed.replace(/\s+/g, " ");
  const withoutSlashes = collapsed.replace(/[\\/]/g, "-");
  const withoutNulls = withoutSlashes.replace(/\0/g, "");
  return withoutNulls.slice(0, 256) || "soubor";
}

/**
 * Zjistí příponu souboru podle content-type.
 * @param {string} contentType - MIME typ.
 * @returns {string} Přípona včetně tečky nebo prázdný řetězec.
 */
function extensionFromContentType(contentType: string): string {
  const base = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  switch (base) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/gif":
      return ".gif";
    case "image/avif":
      return ".avif";
    case "image/svg+xml":
      return ".svg";
    case "video/mp4":
      return ".mp4";
    case "video/webm":
      return ".webm";
    case "video/quicktime":
      return ".mov";
    case "video/x-msvideo":
      return ".avi";
    case "video/x-matroska":
      return ".mkv";
    default:
      return "";
  }
}

/**
 * Vrátí URL pro veřejné čtení objektu (stejný formát jako klientský uploader).
 * @param {string} objectKeyWithBucket - Klíč včetně prefixu bucketu (např. "files/xxx.png").
 * @returns {string} Veřejná URL.
 */
function getPublicFileUrl(objectKeyWithBucket: string): string {
  const endpoint = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL;
  if (!endpoint) {
    throw new Error("NEXT_PUBLIC_MINIO_PUBLIC_URL není nastaven");
  }
  const cleanEndpoint = endpoint.replace(/\/$/, "");
  return `${cleanEndpoint}/${objectKeyWithBucket}`;
}

/**
 * Vytvoří S3 klienta pro MinIO.
 * @returns {S3Client} S3 klient.
 */
function createMinioS3Client(): S3Client {
  const endpoint = getMinIOEndpoint();
  const accessKeyId = process.env.MINIO_ACCESS_KEY;
  const secretAccessKey = process.env.MINIO_SECRET_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Storage konfigurace není kompletní");
  }

  return new S3Client({
    region: process.env.MINIO_REGION || "us-east-1",
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
}

/**
 * Importuje obrázek nebo video z URL do MinIO a vytvoří záznam v DB.
 * @param {Object} input - Parametry importu.
 * @param {string} input.userId - ID uživatele.
 * @param {string} input.url - Zdrojová URL.
 * @param {string | null | undefined} input.folderId - Cílová složka v úložišti.
 * @returns {Promise<{file: Awaited<ReturnType<typeof createFile>>}>} Vytvořený soubor.
 */
export async function importDashboardStorageFileFromUrlService(input: {
  userId: string;
  url: string;
  folderId?: string | null;
}) {
  const sourceUrl = parseHttpUrl(input.url);

  const head = await fetch(sourceUrl, {
    method: "HEAD",
    redirect: "follow",
  }).catch(() => null);

  const headContentType = head?.headers?.get("content-type") ?? null;
  const headContentLength = head?.headers?.get("content-length") ?? null;

  const bucketName = process.env.MINIO_BUCKET_NAME || "files";
  const s3 = createMinioS3Client();

  const getResult = await fetch(sourceUrl, {
    method: "GET",
    redirect: "follow",
    headers: {
      ...(headContentType ? { Accept: headContentType } : {}),
    },
  });

  if (!getResult.ok) {
    throw new Error("Nepodařilo se stáhnout soubor z URL.");
  }

  const contentType =
    getResult.headers.get("content-type")?.trim() ||
    headContentType ||
    "application/octet-stream";

  const normalizedType = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  const isImage = normalizedType.startsWith("image/");
  const isVideo = normalizedType.startsWith("video/");
  if (!isImage && !isVideo) {
    throw new Error("Z URL lze importovat pouze obrázky nebo videa.");
  }

  const declaredLengthRaw =
    getResult.headers.get("content-length") || headContentLength;
  const declaredLength = declaredLengthRaw ? Number(declaredLengthRaw) : NaN;
  if (Number.isFinite(declaredLength) && declaredLength > MAX_IMPORTED_FILE_BYTES) {
    throw new Error("Soubor je příliš velký (max. 50 MB).");
  }

  const urlFileName = decodeURIComponent(sourceUrl.pathname.split("/").pop() || "")
    .trim()
    .replace(/\?.*$/, "");
  const safeBaseName = sanitizeFileName(urlFileName || "soubor");
  const fallbackExt = extensionFromContentType(normalizedType);
  const finalFileName =
    safeBaseName.includes(".") || !fallbackExt ? safeBaseName : `${safeBaseName}${fallbackExt}`;

  const objectKey = `${randomUUID()}-${finalFileName}`;
  const objectKeyWithBucket = `${bucketName}/${objectKey}`;

  let bodyForUpload: any = null;
  const uploadContentLength =
    Number.isFinite(declaredLength) && declaredLength >= 0 ? declaredLength : null;
  let finalSize = uploadContentLength !== null ? Math.max(1, uploadContentLength) : 0;

  if (uploadContentLength !== null) {
    if (!getResult.body) {
      throw new Error("Soubor se nepodařilo načíst.");
    }

    const { Readable } = await import("node:stream");
    bodyForUpload = Readable.fromWeb(getResult.body as any);
  } else {
    const arrayBuffer = await getResult.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_IMPORTED_FILE_BYTES) {
      throw new Error("Soubor je příliš velký (max. 50 MB).");
    }
    finalSize = Math.max(1, arrayBuffer.byteLength);
    bodyForUpload = Buffer.from(arrayBuffer);
  }

  const [stats, user] = await Promise.all([
    getStorageStatsByUserId(input.userId),
    getUserById(input.userId),
  ]);

  const quotaLimit = user?.maxStorageBytes ?? DEFAULT_USER_STORAGE_QUOTA_BYTES;
  const usedBytes = Math.max(0, Number(stats?.totalSize) || 0);
  if (quotaLimit >= 0 && usedBytes + finalSize > quotaLimit) {
    throw new Error("Překročili jste kvótu úložiště.");
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
      Body: bodyForUpload,
      ContentLength: uploadContentLength ?? undefined,
      ContentType: normalizedType || undefined,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  const fileUrl = getPublicFileUrl(objectKeyWithBucket);

  return {
    file: await createFile({
      userId: input.userId,
      folderId: input.folderId ?? null,
      fileUrl,
      fileName: finalFileName,
      fileSize: finalSize,
    }),
  };
}

export async function getDashboardStorageService(input: {
  userId: string;
  type?: string | null;
  folderId?: string | null;
  fileId?: string | null;
  stats?: boolean;
  mine?: boolean;
  userStats?: boolean;
}) {
  if (input.stats) {
    return { stats: await getStorageStats() };
  }

  if (input.userStats) {
    return { stats: await getStorageStatsByUserId(input.userId) };
  }

  if (input.type === "folders") {
    return { folders: await getAllFolders() };
  }

  if (input.fileId) {
    return { file: await getFileById(input.fileId) };
  }

  if (input.folderId) {
    return { files: await getFilesByFolderId(input.folderId) };
  }

  if (input.mine) {
    return { files: await getFilesByUserId(input.userId) };
  }

  return { files: await getAllFiles() };
}

export async function createDashboardStorageItemService(
  userId: string,
  data: unknown,
) {
  const payload = data as { type?: string };

  if (payload.type === "folder") {
    return { folder: await createFolder(CreateFolderSchema.parse(data)) };
  }

  const parsed = CreateStorageFileSchema.parse(data);
  const [stats, user] = await Promise.all([
    getStorageStatsByUserId(userId),
    getUserById(userId),
  ]);

  const quotaLimit = user?.maxStorageBytes ?? DEFAULT_USER_STORAGE_QUOTA_BYTES;
  const usedBytes = Math.max(0, Number(stats?.totalSize) || 0);
  const incomingSize = Math.max(0, Number(parsed.fileSize) || 0);

  if (quotaLimit >= 0 && usedBytes + incomingSize > quotaLimit) {
    throw new Error("Překročili jste kvótu úložiště.");
  }

  return {
    file: await createFile({
      ...parsed,
      userId,
    }),
  };
}

export async function updateDashboardStorageItemService(
  id: string,
  type: string | undefined,
  data: unknown,
) {
  if (type === "folder") {
    return { folder: await updateFolder(id, UpdateFolderSchema.parse(data)) };
  }

  return { file: await updateFile(id, UpdateStorageFileSchema.parse(data)) };
}

export async function deleteDashboardStorageItemService(
  id: string,
  type: string | null,
) {
  return type === "folder" ? deleteFolder(id) : deleteFile(id);
}

function getMinIOEndpoint(): string {
  const host = process.env.MINIO_ENDPOINT ?? "";
  const port = process.env.MINIO_PORT;
  const useSsl = process.env.MINIO_USE_SSL === "true";

  if (host && port) {
    return `${useSsl ? "https" : "http"}://${host}:${port}`;
  }

  return host;
}

function extractObjectKeyFromUrl(fileUrl: string, bucketName: string): string | null {
  try {
    const url = new URL(fileUrl);
    const rawPath = decodeURIComponent(url.pathname.replace(/^\/+/, ""));

    if (!rawPath) return null;
    if (rawPath.startsWith(`${bucketName}/`)) {
      return rawPath.slice(bucketName.length + 1);
    }
    return rawPath;
  } catch {
    return null;
  }
}

function toWebStream(body: unknown): ReadableStream<Uint8Array> | null {
  if (!body) return null;

  if (body instanceof ReadableStream) {
    return body as ReadableStream<Uint8Array>;
  }

  const maybeBody = body as {
    transformToWebStream?: () => ReadableStream<Uint8Array>;
  };
  if (typeof maybeBody.transformToWebStream === "function") {
    return maybeBody.transformToWebStream();
  }

  return null;
}

function guessImageContentType(fileName: string, fallback: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  switch (extension) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "avif":
      return "image/avif";
    case "gif":
      return "image/gif";
    case "svg":
      return "image/svg+xml";
    default:
      return fallback;
  }
}

export async function streamDashboardStorageFileService(fileId: string) {
  const file = await getFileById(fileId);
  if (!file) {
    return null;
  }

  const endpoint = getMinIOEndpoint();
  const bucketName = process.env.MINIO_BUCKET_NAME || "files";
  const accessKeyId = process.env.MINIO_ACCESS_KEY;
  const secretAccessKey = process.env.MINIO_SECRET_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Storage konfigurace není kompletní");
  }

  const objectKey = extractObjectKeyFromUrl(file.fileUrl, bucketName);
  if (!objectKey) {
    throw new Error("Nepodařilo se určit cestu k souboru");
  }

  const s3 = new S3Client({
    region: process.env.MINIO_REGION || "us-east-1",
    endpoint,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });

  const object = await s3.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    }),
  );

  const stream = toWebStream(object.Body);
  if (!stream) {
    throw new Error("Soubor se nepodařilo načíst");
  }

  return {
    stream,
    contentType: guessImageContentType(
      file.fileName,
      object.ContentType || "image/jpeg",
    ),
    contentLength: object.ContentLength,
  };
}

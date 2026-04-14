import { route, type Router } from "@better-upload/server";
import { toRouteHandler } from "@better-upload/server/adapters/next";
import { minio } from "@better-upload/server/clients";

/**
 * Vytvoří URL koncový bodu pro MinIO z prostředí.
 * Kombinuje host, port a SSL flag do jednoho URL.
 * @returns {string} URL koncový bodu pro MinIO.
 */
function getMinIOEndpoint(): string {
  const MINIO_HOST = process.env.MINIO_ENDPOINT ?? "";
  const MINIO_PORT = process.env.MINIO_PORT;
  const MINIO_USE_SSL = process.env.MINIO_USE_SSL === "true";

  if (MINIO_HOST && MINIO_PORT) {
    return `${MINIO_USE_SSL ? "https" : "http"}://${MINIO_HOST}:${MINIO_PORT}`;
  }

  return MINIO_HOST;
}

const MINIO_ENDPOINT_URL = getMinIOEndpoint();

/**
 * Vytvoří BetterUpload router pro nahrávání souborů.
 * @returns {Router} Konfigurovaný BetterUpload router.
 */
function createUploadRouter(): Router {
  return {
    client: minio({
      region: process.env.MINIO_REGION || "us-east-1",
      endpoint: MINIO_ENDPOINT_URL || "",
      accessKeyId: process.env.MINIO_ACCESS_KEY || "",
      secretAccessKey: process.env.MINIO_SECRET_KEY || "",
    }),
    bucketName: process.env.MINIO_BUCKET_NAME || "files",
    routes: {
      profile: route({
        fileTypes: ["image/*"],
        multipleFiles: false,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        onBeforeUpload: async () => {
          if (!MINIO_ENDPOINT_URL) {
            throw new Error("Storage endpoint není nastaven");
          }

          if (!process.env.MINIO_ACCESS_KEY) {
            throw new Error("Storage access key není nastaven");
          }

          return {
            bucketName: "profiles",
          };
        },
        onAfterSignedUrl: async () => {},
      }),
      storage: route({
        fileTypes: [
          "image/*",
          "image/webp",
          "application/pdf",
          "application/zip",
          "application/x-zip-compressed",
          "text/*",
          "audio/*",
          "video/*",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "application/json",
        ],
        multipleFiles: true,
        maxFileSize: 50 * 1024 * 1024, // 50MB
        onBeforeUpload: async () => {
          if (!MINIO_ENDPOINT_URL) {
            throw new Error("Storage endpoint není nastaven");
          }

          if (!process.env.MINIO_ACCESS_KEY) {
            throw new Error("Storage access key není nastaven");
          }

          return {
            bucketName: process.env.MINIO_BUCKET_NAME || "files",
          };
        },
        onAfterSignedUrl: async () => {},
      }),
      ads: route({
        fileTypes: ["image/*"],
        multipleFiles: false,
        maxFileSize: 10 * 1024 * 1024,
        onBeforeUpload: async () => {
          if (!MINIO_ENDPOINT_URL) {
            throw new Error("Storage endpoint není nastaven");
          }

          if (!process.env.MINIO_ACCESS_KEY) {
            throw new Error("Storage access key není nastaven");
          }

          return {
            bucketName: "ads",
          };
        },
        onAfterSignedUrl: async () => {},
      }),
    },
  };
}

const router: Router = createUploadRouter();
const handler = toRouteHandler(router);

/**
 * Obslouží upload požadavek přes BetterUpload handler.
 * @param {Request} req - Příchozí HTTP požadavek.
 * @returns {Promise<Response>} Odpověď z handleru BetterUpload.
 */
export async function handleUploadRequest(req: Request): Promise<Response> {
  return handler.POST(req);
}


import * as dotenv from "dotenv";
import {
  CreateBucketCommand,
  HeadBucketCommand,
  S3Client,
  type HeadBucketCommandOutput,
} from "@aws-sdk/client-s3";

/**
 * Inicializuje S3 kompatibilní storage (MinIO/RustFS) pro lokální/dev prostředí.
 *
 * Co skript dělá:
 * - načte `.env.local` a `.env`
 * - připojí se na MinIO přes S3 API
 * - ověří existenci bucketů a chybějící automaticky vytvoří
 *
 * Použité ENV:
 * - MINIO_ENDPOINT (povinné) - hostname nebo URL
 * - MINIO_PORT (volitelné) - pokud je MINIO_ENDPOINT hostname bez portu
 * - MINIO_USE_SSL (volitelné) - "true"/"false"
 * - MINIO_REGION (volitelné)
 * - MINIO_ACCESS_KEY (povinné)
 * - MINIO_SECRET_KEY (povinné)
 * - MINIO_BUCKET_NAME (volitelné) - název hlavního bucketu, default "files"
 */

function loadEnv() {
  dotenv.config({ path: ".env.local" });
  dotenv.config({ path: ".env" });
}

/**
 * Sestaví endpoint pro MinIO.
 * Podporuje varianty:
 * - MINIO_ENDPOINT="http://127.0.0.1" + MINIO_PORT="9000"
 * - MINIO_ENDPOINT="http://127.0.0.1:9000"
 * - MINIO_ENDPOINT="127.0.0.1" + MINIO_PORT="9000"
 * @returns {string} Endpoint URL.
 */
function getMinIOEndpoint(): string {
  const hostRaw = (process.env.MINIO_ENDPOINT ?? "").trim();
  const portRaw = (process.env.MINIO_PORT ?? "").trim();
  const useSsl = (process.env.MINIO_USE_SSL ?? "").trim() === "true";

  if (!hostRaw) return "";

  const hasProtocol = /^https?:\/\//i.test(hostRaw);
  const hostWithProtocol = hasProtocol
    ? hostRaw
    : `${useSsl ? "https" : "http"}://${hostRaw}`;

  try {
    const url = new URL(hostWithProtocol);
    if (!url.port && portRaw) {
      url.port = portRaw;
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    if (portRaw) {
      return `${useSsl ? "https" : "http"}://${hostRaw}:${portRaw}`;
    }
    return hostWithProtocol.replace(/\/$/, "");
  }
}

/**
 * Vytvoří S3 klienta pro MinIO.
 * @param {Object} input - Konfigurace klienta.
 * @param {string} input.endpoint - Endpoint URL.
 * @param {string} input.region - Region.
 * @param {string} input.accessKeyId - Access key.
 * @param {string} input.secretAccessKey - Secret key.
 * @returns {S3Client} S3 klient.
 */
function createS3Client(input: {
  endpoint: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}): S3Client {
  return new S3Client({
    region: input.region,
    endpoint: input.endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: input.accessKeyId,
      secretAccessKey: input.secretAccessKey,
    },
  });
}

/**
 * Vrátí true, pokud bucket existuje.
 * @param {S3Client} s3 - S3 klient.
 * @param {string} bucket - Název bucketu.
 * @returns {Promise<boolean>} Existence bucketu.
 */
async function bucketExists(s3: S3Client, bucket: string): Promise<boolean> {
  try {
    const result: HeadBucketCommandOutput = await s3.send(
      new HeadBucketCommand({ Bucket: bucket }),
    );
    return Boolean(result);
  } catch (error: any) {
    const status = error?.$metadata?.httpStatusCode;
    const name = String(error?.name ?? "");
    if (status === 404 || name === "NotFound" || name === "NoSuchBucket") {
      return false;
    }
    throw error;
  }
}

/**
 * Založí bucket, pokud neexistuje.
 * @param {S3Client} s3 - S3 klient.
 * @param {string} bucket - Název bucketu.
 * @returns {Promise<"created" | "exists">} Výsledek operace.
 */
async function ensureBucket(
  s3: S3Client,
  bucket: string,
): Promise<"created" | "exists"> {
  const exists = await bucketExists(s3, bucket);
  if (exists) return "exists";

  await s3.send(new CreateBucketCommand({ Bucket: bucket }));
  return "created";
}

async function main() {
  loadEnv();

  const endpoint = getMinIOEndpoint();
  const accessKeyId = (process.env.MINIO_ACCESS_KEY ?? "").trim();
  const secretAccessKey = (process.env.MINIO_SECRET_KEY ?? "").trim();
  const region = (process.env.MINIO_REGION ?? "us-east-1").trim();

  if (!endpoint) {
    throw new Error("MINIO_ENDPOINT není nastaven");
  }
  if (!accessKeyId) {
    throw new Error("MINIO_ACCESS_KEY není nastaven");
  }
  if (!secretAccessKey) {
    throw new Error("MINIO_SECRET_KEY není nastaven");
  }

  const filesBucket = (process.env.MINIO_BUCKET_NAME ?? "files").trim() || "files";
  const buckets = [filesBucket, "profiles", "ads"];

  console.log(`→ Storage endpoint: ${endpoint}`);
  console.log(`→ Zakládám/ověřuji buckety: ${buckets.join(", ")}`);

  const s3 = createS3Client({ endpoint, region, accessKeyId, secretAccessKey });

  for (const bucket of buckets) {
    const result = await ensureBucket(s3, bucket);
    console.log(`- ${bucket}: ${result === "created" ? "vytvořen" : "už existuje"}`);
  }

  console.log("");
  console.log("Hotovo. Storage je připravené.");
}

main().catch((err) => {
  console.error("storage:init selhal:", err);
  process.exit(1);
});


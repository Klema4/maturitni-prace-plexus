import crypto from "node:crypto";

/**
 * Šifrování tajných hodnot pro uložení do DB.
 * Používá AES-256-GCM a aplikační master key z env `SECRETS_ENCRYPTION_KEY_BASE64` (32 bytů v base64).
 *
 * @param {string} plaintext - Tajná hodnota v plaintextu.
 * @returns {{ ciphertextB64: string; ivB64: string; tagB64: string }} Šifrovaný payload pro DB.
 */
export function encryptSecret(plaintext: string): {
  ciphertextB64: string;
  ivB64: string;
  tagB64: string;
} {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);

  const ciphertext = Buffer.concat([
    cipher.update(Buffer.from(plaintext, "utf8")),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    ciphertextB64: ciphertext.toString("base64"),
    ivB64: iv.toString("base64"),
    tagB64: tag.toString("base64"),
  };
}

/**
 * Dešifrování tajných hodnot uložených v DB.
 *
 * @param {Object} payload - Šifrovaný payload z DB.
 * @param {string} payload.ciphertextB64 - Ciphertext v base64.
 * @param {string} payload.ivB64 - IV v base64.
 * @param {string} payload.tagB64 - Auth tag v base64.
 * @returns {string} Dešifrovaný plaintext.
 */
export function decryptSecret(payload: {
  ciphertextB64: string;
  ivB64: string;
  tagB64: string;
}): string {
  const key = getEncryptionKey();
  const iv = Buffer.from(payload.ivB64, "base64");
  const tag = Buffer.from(payload.tagB64, "base64");
  const ciphertext = Buffer.from(payload.ciphertextB64, "base64");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);

  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return plaintext.toString("utf8");
}

/**
 * Načtení a validace master key pro šifrování tajných hodnot.
 *
 * @returns {Buffer} 32-bytový klíč.
 */
function getEncryptionKey(): Buffer {
  const b64 = process.env.SECRETS_ENCRYPTION_KEY_BASE64;
  if (!b64) {
    throw new Error(
      "SECRETS_ENCRYPTION_KEY_BASE64 environment variable is not set (expected 32 bytes base64).",
    );
  }

  const key = Buffer.from(b64, "base64");
  if (key.length !== 32) {
    throw new Error(
      `SECRETS_ENCRYPTION_KEY_BASE64 has invalid length (${key.length}); expected 32 bytes.`,
    );
  }

  return key;
}


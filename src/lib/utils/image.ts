const ALLOWED_IMAGE_HOSTS = new Set([
  "avatar.adam-klement.cz",
  "images.unsplash.com",
  "picsum.photos",
  "maturita-cdn.adam-klement.cz",
]);

export function getSafeImageSrc(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  if (trimmedValue.startsWith("/")) {
    return trimmedValue;
  }

  try {
    const url = new URL(trimmedValue);

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return null;
    }

    if (!ALLOWED_IMAGE_HOSTS.has(url.hostname)) {
      return null;
    }

    return trimmedValue;
  } catch {
    return null;
  }
}

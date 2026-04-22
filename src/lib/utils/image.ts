const IMAGE_QUERY_REGEX =
  /^\?(?:[^=&]+=[^&]*)(?:&[^=&]+=[^&]*)*$/;
const PROFILE_HOSTNAME = "maturita-cdn.adam-klement.cz";
const PROFILE_PATH_PREFIX = "/profiles/";
const ALLOWED_IMAGE_HOSTS = new Set([
  "avatar.adam-klement.cz",
  "images.unsplash.com",
  "picsum.photos",
  PROFILE_HOSTNAME,
]);

export type SafeImageResult = {
  src: string | null;
  isProfileImage: boolean;
};

const EMPTY_IMAGE: SafeImageResult = { src: null, isProfileImage: false };

/**
 * Pokusí se vrátit dekódovanou URL (pro případ dvojitého encodingu).
 */
function decodeImageValue(value: string): string {
  if (!value.includes("%")) return value;

  let current = value;
  for (let i = 0; i < 2; i += 1) {
    try {
      const next = decodeURIComponent(current);
      if (next === current) break;
      current = next;
    } catch {
      return value;
    }
  }

  return current;
}

/**
 * Opraví URL, kde query začíná omylem ampersandem (`...png&w=32` -> `...png?w=32`).
 */
function normalizeImageQuery(value: string): string {
  if (value.includes("?") || !value.includes("&")) return value;

  const firstAmpersand = value.indexOf("&");
  const queryPart = value.slice(firstAmpersand + 1);
  return IMAGE_QUERY_REGEX.test(`?${queryPart}`)
    ? `${value.slice(0, firstAmpersand)}?${queryPart}`
    : value;
}

/**
 * Vrátí strukturu bezpečného obrázku pro jednu kandidátskou URL.
 */
function getImageInfoFromUrl(value: string): SafeImageResult | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (
    (url.protocol !== "https:" && url.protocol !== "http:") ||
    !ALLOWED_IMAGE_HOSTS.has(url.hostname)
  ) {
    return null;
  }

  const isProfileImage =
    url.hostname === PROFILE_HOSTNAME && url.pathname.startsWith(PROFILE_PATH_PREFIX);

  return {
    src: isProfileImage
      ? `${url.protocol}//${url.hostname}${url.pathname}`
      : url.toString(),
    isProfileImage,
  };
}

/**
 * Vrátí bezpečné URL pro `next/image`.
 */
export function getSafeImageSrc(value?: string | null): string | null {
  return getSafeImageInfo(value).src;
}

/**
 * Vrátí bezpečné URL a příznak, zda se má obrázek načítat bez optimalizace.
 */
export function getSafeImageInfo(value?: string | null): SafeImageResult {
  if (!value?.trim()) return EMPTY_IMAGE;

  const trimmedValue = value.trim();
  if (trimmedValue.startsWith("/")) {
    return { src: normalizeImageQuery(trimmedValue), isProfileImage: false };
  }

  const normalizedCandidate = normalizeImageQuery(trimmedValue);
  const imageInfo = getImageInfoFromUrl(normalizedCandidate);
  if (imageInfo) return imageInfo;

  const decoded = decodeImageValue(trimmedValue);
  if (decoded !== trimmedValue) {
    return getImageInfoFromUrl(normalizeImageQuery(decoded)) ?? EMPTY_IMAGE;
  }

  return EMPTY_IMAGE;
}

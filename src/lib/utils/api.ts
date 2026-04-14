/**
 * Low-level authenticated fetch helpers shared by dashboard-like client features.
 */
export async function apiFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: "include",
  });
}

export async function apiFetchOrThrow(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const response = await apiFetch(url, options);

  if (!response.ok) {
    await parseApiError(response, "Nepodařilo se načíst data");
  }

  return response;
}

export async function parseApiError(
  response: Response,
  fallback: string = "Nepodařilo se dokončit operaci",
): Promise<never> {
  let message = fallback;

  try {
    const json = await response.json();
    if (typeof json?.error === "string") {
      message = json.error;
    }
  } catch {
    message = response.statusText || message;
  }

  throw new Error(message);
}

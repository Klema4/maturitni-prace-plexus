/**
 * Pomocná funkce pro `fetch` volání na dashboard API.
 * Zajišťuje odeslání cookies (credentials) a parsování chybových odpovědí.
 *
 * Důležitá změna:
 * - Centralizované dočasné deduplikování GET požadavků podle URL.
 *   Pokud už je aktivně probíhající GET požadavek na stejnou URL, další volání
 *   obdrží nový `Response` postavený z uloženého textového těla výsledku.
 *   To zabrání masivním paralelním voláním téhož koncový bodu (request storm).
 *
 * Poznámky a omezení:
 * - Ke klasickému chování `fetch` se vracíme pro metody jiné než GET.
 * - Uložená položka se odstraní po krátkém TTL (2 s). TTL lze upravit.
 * - Implementace používá `Response` konstruktor (dostupný v prohlížeči / node fetch).
 *
 * @param url - URL koncový bodu
 * @param options - Volitelné možnosti pro `fetch`
 * @returns `Promise<Response>`
 */
const _inFlightGet = new Map<
  string,
  Promise<{
    text: string;
    status: number;
    statusText?: string;
    headers: [string, string][];
  }>
>();

const _GET_CACHE_TTL_MS = 2000;

function _buildResponseFromEntry(entry: {
  text: string;
  status: number;
  statusText?: string;
  headers: [string, string][];
}): Response {
  const hdrs = new Headers();
  for (const [k, v] of entry.headers) {
    try {
      hdrs.set(k, v);
    } catch {
      // Ignoruj neplatnou hlavičku
    }
  }
  return new Response(entry.text, {
    status: entry.status,
    statusText: entry.statusText,
    headers: hdrs,
  });
}

async function _doGetDedup(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const key = url;

  // Pokud už pro tuto URL běží GET požadavek, počkej na jeho výsledek
  // a vrať novou `Response` vytvořenou z uloženého textu.
  if (_inFlightGet.has(key)) {
    const entry = await _inFlightGet.get(key)!;
    return _buildResponseFromEntry(entry);
  }

  const p = (async () => {
    const res = await fetch(url, {
      ...options,
      credentials: "include",
    });
    // Načti odpověď jako text, aby šlo vytvořit nové `Response` i pro další volající.
    const text = await res.text();
    const headersArray = Array.from(res.headers.entries()) as [
      string,
      string,
    ][];
    return {
      text,
      status: res.status,
      statusText: res.statusText,
      headers: headersArray,
    };
  })();

  // Ulož promise, aby paralelní volání sdílela stejnou síťovou operaci
  _inFlightGet.set(key, p);

  try {
    const entry = await p;
    // Naplánuj úklid po krátkém TTL, aby se záznam nedržel v paměti donekonečna
    setTimeout(() => {
      _inFlightGet.delete(key);
    }, _GET_CACHE_TTL_MS);
    return _buildResponseFromEntry(entry);
  } catch (err) {
    // Při chybě vždy vyčisti mapu
    _inFlightGet.delete(key);
    throw err;
  }
}

export async function dashboardFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const method = (options?.method ?? "GET").toUpperCase();
  if (method === "GET") {
    // Použij deduplikovanou větev pro GET
    return _doGetDedup(url, options);
  }

  // Pro non-GET jen propusť volání dál a zachovej credentials
  return fetch(url, {
    ...options,
    credentials: "include",
  });
}

/**
 * Fetch s automatickým vyhozením chyby při !res.ok.
 * Hodí chybu s textem z API odpovědi (pokud je JSON s polem error).
 * @param url - URL koncový bodu
 * @param options - Volitelné fetch options
 * @returns Promise<Response>
 */
export async function dashboardFetchOrThrow(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const res = await dashboardFetch(url, options);
  if (!res.ok) {
    let message = "Nepodařilo se načíst data";
    try {
      const json = await res.json();
      if (typeof json?.error === "string") {
        message = json.error;
      }
    } catch {
      message = res.statusText || message;
    }
    throw new Error(message);
  }
  return res;
}

/**
 * Parsuje chybovou odpověď z API a vyhodí Error.
 * Použij po fetch když res.ok === false.
 */
export async function parseDashboardError(res: Response): Promise<never> {
  let message = "Nepodařilo se dokončit operaci";
  try {
    const json = await res.json();
    if (typeof json?.error === "string") message = json.error;
  } catch {
    message = res.statusText || message;
  }
  throw new Error(message);
}

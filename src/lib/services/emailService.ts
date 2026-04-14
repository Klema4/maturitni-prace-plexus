import { getSystemPlunkConfig } from "@/lib/services/settingsPlunkService";

const PLUNK_API_URL = "https://next-api.useplunk.com/v1/send";

/**
 * Odeslání emailu přes Plunk transactional API.
 * Preferuje `apiKey` předaný v parametrech; fallback je `PLUNK_API_KEY` z env.
 * @param {Object} params - Parametry emailu.
 * @param {string | string[]} params.to - Příjemce/příjemci emailu.
 * @param {string} params.subject - Předmět emailu.
 * @param {string} params.body - HTML tělo emailu (HTML string).
 * @param {string} [params.apiKey] - Plunk API key (např. uložený per-organizace v DB).
 * @param {string} [params.fromEmail] - Odesílací email nastavený v Plunku (verified sender).
 * @returns {Promise<void>} Promise bez návratové hodnoty (loguje chyby, ale nevyhazuje je dál).
 */
export async function sendEmailWithPlunk(params: {
  to: string | string[];
  subject: string;
  body: string;
  apiKey?: string;
  fromEmail?: string;
}): Promise<void> {
  const needsSystemFallback = !params.apiKey || !params.fromEmail;
  const systemConfig = needsSystemFallback ? await getSystemPlunkConfig() : null;

  const apiKey =
    params.apiKey ??
    systemConfig?.apiKey ??
    process.env.PLUNK_SECRET_KEY ??
    process.env.PLUNK_API_KEY;
  const fromEmail =
    params.fromEmail ?? systemConfig?.fromEmail ?? undefined;

  if (!apiKey) {
    console.warn(
      "[Plunk] API key není nastaven (DB ani PLUNK_SECRET_KEY/PLUNK_API_KEY v env) – email nebude odeslán.",
    );
    return;
  }

  try {
    const htmlBody = params.body;
    const res = await fetch(PLUNK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: params.to,
        subject: params.subject,
        body: htmlBody,
        ...(fromEmail ? { from: fromEmail } : {}),
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      const errorCode = data?.error?.code ? String(data.error.code) : "UNKNOWN";
      const errorMessage = data?.error?.message
        ? String(data.error.message)
        : "Email odeslání selhalo";
      const requestId = data?.error?.requestId ? String(data.error.requestId) : null;

      console.error(
        "[Plunk] Email odeslání selhalo",
        res.status,
        `[${errorCode}]`,
        errorMessage,
        requestId ? `(requestId: ${requestId})` : "",
      );
    }
  } catch (error) {
    console.error("[Plunk] Chyba při odesílání emailu", error);
  }
}


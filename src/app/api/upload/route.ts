import { handleUploadRequest } from "@/lib/services/uploadService";

/**
 * POST /api/upload
 * Tenký obal kolem BetterUpload handleru pro nahrávání souborů.
 * Přidává CORS hlavičky a jednotnou chybovou odpověď.
 * @param {Request} req - Příchozí HTTP požadavek.
 * @returns {Promise<Response>} HTTP odpověď.
 */
export const POST = async (req: Request): Promise<Response> => {
  try {
    const response = await handleUploadRequest(req);

    const headers = new Headers(response.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error: any) {
    console.error("[Upload] Error in POST route:", error);
    return new Response(
      JSON.stringify({
        error: error?.message || "Chyba při zpracování uploadu",
        details: process.env.NODE_ENV === "development" ? error?.stack : undefined,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  }
};

/**
 * OPTIONS /api/upload
 * Obsluha CORS preflight požadavku pro upload koncový bod.
 * @returns {Promise<Response>} Prázdná 200 odpověď s CORS hlavičkami.
 */
export const OPTIONS = async (): Promise<Response> => {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};

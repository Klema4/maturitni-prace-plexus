import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { importDashboardStorageFileFromUrlService } from "@/lib/services/dashboardStorageService";

/**
 * Import souboru (obrázek/video) z URL do úložiště.
 * Stahování probíhá na serveru kvůli CORS a validaci typu/velikosti.
 * @param {NextRequest} request - Příchozí požadavek.
 * @returns {Promise<NextResponse>} Odpověď s vytvořeným souborem.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const body = (await request.json()) as {
      url?: string;
      folderId?: string | null;
    };

    if (!body?.url || typeof body.url !== "string") {
      return NextResponse.json({ error: "Chybí url" }, { status: 400 });
    }

    const result = await importDashboardStorageFileFromUrlService({
      userId: session.user.id,
      url: body.url,
      folderId: body.folderId ?? null,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error importing storage file from URL:", error);
    return NextResponse.json(
      { error: error?.message || "Nepodařilo se importovat soubor z URL" },
      { status: 400 },
    );
  }
}


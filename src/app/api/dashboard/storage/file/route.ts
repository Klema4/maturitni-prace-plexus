import { NextRequest, NextResponse } from "next/server";
import { streamDashboardStorageFileService } from "@/lib/services/dashboardStorageService";

export async function GET(request: NextRequest) {
  try {
    const fileId = request.nextUrl.searchParams.get("fileId");
    if (!fileId) {
      return NextResponse.json({ error: "Chybí fileId" }, { status: 400 });
    }

    const result = await streamDashboardStorageFileService(fileId);
    if (!result) {
      return NextResponse.json({ error: "Soubor nebyl nalezen" }, { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", result.contentType);
    headers.set("Cache-Control", "private, max-age=300");
    headers.set("X-Content-Type-Options", "nosniff");
    if (typeof result.contentLength === "number") {
      headers.set("Content-Length", result.contentLength.toString());
    }

    return new NextResponse(result.stream, { status: 200, headers });
  } catch (error: any) {
    console.error("Error streaming storage file:", error);
    return NextResponse.json(
      { error: error?.message || "Nepodařilo se načíst soubor z úložiště" },
      { status: 500 },
    );
  }
}

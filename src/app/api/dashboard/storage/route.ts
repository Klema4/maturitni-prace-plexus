import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createDashboardStorageItemService,
  deleteDashboardStorageItemService,
  getDashboardStorageService,
  updateDashboardStorageItemService,
} from "@/lib/services/dashboardStorageService";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const result = await getDashboardStorageService({
      userId: session.user.id,
      type: searchParams.get("type"),
      folderId: searchParams.get("folderId"),
      fileId: searchParams.get("fileId"),
      stats: searchParams.get("stats") === "true",
      mine: searchParams.get("mine") === "true",
      userStats: searchParams.get("userStats") === "true",
    });

    if ("file" in result && result.file === null) {
      return NextResponse.json({ error: "Soubor nenalezen" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching storage:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst úložiště" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const result = await createDashboardStorageItemService(
      session.user.id,
      await request.json(),
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error creating storage item:", error);
    return NextResponse.json(
      { error: error.message || "Nepodařilo se vytvořit položku" },
      { status: 400 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const body = await request.json();
    if (!body?.id) {
      return NextResponse.json({ error: "Chybí id" }, { status: 400 });
    }

    const result = await updateDashboardStorageItemService(body.id, body.type, body);
    if (("folder" in result && !result.folder) || ("file" in result && !result.file)) {
      return NextResponse.json(
        { error: body.type === "folder" ? "Složka nenalezena" : "Soubor nenalezen" },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error updating storage item:", error);
    return NextResponse.json(
      { error: error.message || "Nepodařilo se aktualizovat položku" },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Chybí id" }, { status: 400 });
    }

    const success = await deleteDashboardStorageItemService(
      id,
      searchParams.get("type"),
    );

    if (!success) {
      return NextResponse.json(
        { error: "Nepodařilo se smazat položku" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting storage item:", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat položku" },
      { status: 500 },
    );
  }
}

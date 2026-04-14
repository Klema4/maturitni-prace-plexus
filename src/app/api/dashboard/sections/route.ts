import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  createDashboardSectionService,
  deleteDashboardSectionService,
  listDashboardSectionsService,
  updateDashboardSectionService,
} from "@/lib/services/dashboardSectionsService";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Nejste přihlášeni" }, { status: 401 });
    }

    return NextResponse.json(await listDashboardSectionsService());
  } catch (error) {
    console.error("Error fetching sections:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst sekce" },
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

    const section = await createDashboardSectionService(await request.json());
    return NextResponse.json({ section }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating section:", error);
    return NextResponse.json(
      { error: error.message || "Nepodařilo se vytvořit sekci" },
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
      return NextResponse.json({ error: "Chybí id sekce" }, { status: 400 });
    }

    const section = await updateDashboardSectionService(body.id, body);
    if (!section) {
      return NextResponse.json({ error: "Sekce nenalezena" }, { status: 404 });
    }

    return NextResponse.json({ section });
  } catch (error: any) {
    console.error("Error updating section:", error);
    return NextResponse.json(
      { error: error.message || "Nepodařilo se aktualizovat sekci" },
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

    const sectionId = new URL(request.url).searchParams.get("id");
    if (!sectionId) {
      return NextResponse.json({ error: "Chybí id sekce" }, { status: 400 });
    }

    await deleteDashboardSectionService(sectionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat sekci" },
      { status: 500 },
    );
  }
}

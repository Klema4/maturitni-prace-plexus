import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getAllTagsService,
  getTagsWithUsageService,
  getTagByIdService,
  createTagService,
  updateTagService,
  deleteTagService,
} from "@/lib/services/tagsService";

/**
 * GET /api/dashboard/tags
 * Získání seznamu štítků
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nejste přihlášeni" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const withUsage = searchParams.get("withUsage") === "true";
    const tagId = searchParams.get("id");

    if (tagId) {
      const tag = await getTagByIdService(tagId);
      if (!tag) {
        return NextResponse.json(
          { error: "Štítek nenalezen" },
          { status: 404 }
        );
      }
      return NextResponse.json({ tag });
    }

    if (withUsage) {
      const tags = await getTagsWithUsageService();
      return NextResponse.json({ tags });
    }

    const tags = await getAllTagsService();
    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst štítky" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dashboard/tags
 * Vytvoření nového štítku
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nejste přihlášeni" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const tag = await createTagService(body);

    return NextResponse.json({ tag }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating tag:", error);
    return NextResponse.json(
      { error: error.message || "Nepodařilo se vytvořit štítek" },
      { status: 400 }
    );
  }
}

/**
 * PATCH /api/dashboard/tags
 * Aktualizace štítku
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nejste přihlášeni" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Chybí id štítku" },
        { status: 400 }
      );
    }

    const tag = await updateTagService(id, data);

    if (!tag) {
      return NextResponse.json(
        { error: "Štítek nenalezen" },
        { status: 404 }
      );
    }

    return NextResponse.json({ tag });
  } catch (error: any) {
    console.error("Error updating tag:", error);
    return NextResponse.json(
      { error: error.message || "Nepodařilo se aktualizovat štítek" },
      { status: 400 }
    );
  }
}

/**
 * DELETE /api/dashboard/tags
 * Smazání štítku
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Nejste přihlášeni" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const tagId = searchParams.get("id");

    if (!tagId) {
      return NextResponse.json(
        { error: "Chybí id štítku" },
        { status: 400 }
      );
    }

    const success = await deleteTagService(tagId);

    if (!success) {
      return NextResponse.json(
        { error: "Nepodařilo se smazat štítek" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tag:", error);
    return NextResponse.json(
      { error: "Nepodařilo se smazat štítek" },
      { status: 500 }
    );
  }
}

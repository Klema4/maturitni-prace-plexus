import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserFavoriteTags, addFavoriteTag, removeFavoriteTag } from "@/lib/repositories/favoriteTagsRepository";
import { z } from "zod";

const FavoriteTagSchema = z.object({
  tagId: z.string().uuid("Neplatné ID tagu"),
});

/**
 * GET /api/user/favorite-tags
 * Získání všech oblíbených tagů přihlášeného uživatele
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

    const favoriteTags = await getUserFavoriteTags(session.user.id);

    return NextResponse.json({ tags: favoriteTags });
  } catch (error) {
    console.error("Error fetching favorite tags:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst oblíbené tagy" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/favorite-tags
 * Přidání oblíbeného tagu přihlášenému uživateli
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
    const validatedData = FavoriteTagSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const success = await addFavoriteTag(session.user.id, validatedData.data.tagId);

    if (!success) {
      return NextResponse.json(
        { error: "Nepodařilo se přidat oblíbený tag" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error adding favorite tag:", error);
    return NextResponse.json(
      { error: "Nepodařilo se přidat oblíbený tag" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/favorite-tags
 * Odebrání oblíbeného tagu přihlášenému uživateli
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

    const body = await request.json();
    const validatedData = FavoriteTagSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: validatedData.error.issues[0].message },
        { status: 400 }
      );
    }

    const success = await removeFavoriteTag(session.user.id, validatedData.data.tagId);

    if (!success) {
      return NextResponse.json(
        { error: "Nepodařilo se odebrat oblíbený tag" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing favorite tag:", error);
    return NextResponse.json(
      { error: "Nepodařilo se odebrat oblíbený tag" },
      { status: 500 }
    );
  }
}

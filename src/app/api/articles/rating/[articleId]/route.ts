import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserArticleRating } from "@/lib/repositories/articlesRepository";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ articleId: string }>;
};

/**
 * GET /api/articles/rating/[articleId]
 * Získání hodnocení uživatele pro článek
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { articleId } = await params;

    // Validace articleId
    if (!z.string().uuid().safeParse(articleId).success) {
      return NextResponse.json(
        { error: "Neplatný formát identifikátoru článku" },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { rating: null },
        { status: 200 }
      );
    }

    const rating = await getUserArticleRating(articleId, session.user.id);

    return NextResponse.json({ rating });
  } catch (error) {
    console.error("Error getting article rating:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst hodnocení" },
      { status: 500 }
    );
  }
}

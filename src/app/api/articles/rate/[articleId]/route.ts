import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { toggleArticleRating } from "@/lib/repositories/articlesRepository";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ articleId: string }>;
};

const RateArticleSchema = z.object({
  isLike: z.boolean(),
});

/**
 * PATCH /api/articles/rate/[articleId]
 * Hodnocení článku (like/dislike)
 */
export async function PATCH(
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
        { error: "Pro hodnocení článku se musíte přihlásit" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validace těla požadavku
    const validatedBody = RateArticleSchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: "Neplatná data pro hodnocení" },
        { status: 400 }
      );
    }

    const { isLike } = validatedBody.data;

    const result = await toggleArticleRating(articleId, session.user.id, isLike);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error rating article:", error);
    return NextResponse.json(
      { error: "Nepodařilo se hodnotit článek" },
      { status: 500 }
    );
  }
}

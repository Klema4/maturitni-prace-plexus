import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { rateComment } from "@/lib/services/commentsService";
import { RateCommentSchema } from "@/lib/schemas/commentsSchema";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ commentId: string }>;
};

/**
 * PATCH /api/comments/[commentId]/rate
 * Hodnocení komentáře (like/dislike)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { commentId } = await params;

    // Validace commentId
    if (!z.string().uuid().safeParse(commentId).success) {
      return NextResponse.json(
        { error: "Neplatný formát identifikátoru komentáře" },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Pro hodnocení komentáře se musíte přihlásit" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validace těla požadavku
    const validatedBody = RateCommentSchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: "Neplatná data pro hodnocení" },
        { status: 400 }
      );
    }

    const { isLike } = validatedBody.data;

    const result = await rateComment(commentId, session.user.id, isLike);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error rating comment:", error);
    return NextResponse.json(
      { error: "Nepodařilo se hodnotit komentář" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCommentReplies } from "@/lib/services/commentsService";
import { getEffectivePermissionsForUser } from "@/lib/repositories/rolesRepository";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ commentId: string }>;
};

/**
 * GET /api/comments/[commentId]/replies
 * Získání odpovědí na komentář
 */
export async function GET(
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
    const userId = session?.user?.id;

    const includeHidden = userId
      ? hasPermission(
          await getEffectivePermissionsForUser(userId),
          PERMISSIONS.COMMENTS_VIEW | PERMISSIONS.COMMENTS_MODERATE
        )
      : false;

    const replies = await getCommentReplies(commentId, userId, includeHidden);

    return NextResponse.json({ replies });
  } catch (error) {
    console.error("Error fetching replies:", error);
    return NextResponse.json(
      { error: "Nepodařilo se načíst odpovědi" },
      { status: 500 }
    );
  }
}

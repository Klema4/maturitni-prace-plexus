import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { deleteCommentAsModerator } from "@/lib/services/commentsService";
import { getEffectivePermissionsForUser } from "@/lib/repositories/rolesRepository";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ commentId: string }>;
};

/**
 * DELETE /api/comments/[commentId]
 * Smazání komentáře moderátorem/adminem.
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { commentId } = await params;

    if (!z.string().uuid().safeParse(commentId).success) {
      return NextResponse.json(
        { error: "Neplatný formát identifikátoru komentáře" },
        { status: 400 }
      );
    }

    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Pro smazání komentáře se musíte přihlásit" },
        { status: 401 }
      );
    }

    const userPermissions = await getEffectivePermissionsForUser(session.user.id);
    if (!hasPermission(userPermissions, PERMISSIONS.COMMENTS_DELETE)) {
      return NextResponse.json(
        { error: "Nemáte oprávnění mazat komentáře" },
        { status: 403 }
      );
    }

    const comment = await deleteCommentAsModerator(commentId, session.user.id);

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Error deleting comment:", error);
    const errorMessage = error instanceof Error ? error.message : "Nepodařilo se smazat komentář";
    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage === "Komentář nenalezen" ? 404 : 500 }
    );
  }
}

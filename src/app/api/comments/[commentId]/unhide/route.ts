import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { unmoderateComment } from "@/lib/services/commentsService";
import { getEffectivePermissionsForUser } from "@/lib/repositories/rolesRepository";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ commentId: string }>;
};

/**
 * POST /api/comments/[commentId]/unhide
 * Zobrazení komentáře (odvolání moderace)
 */
export async function POST(
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
        { error: "Pro odvolání moderace komentáře se musíte přihlásit" },
        { status: 401 }
      );
    }

    // Kontrola oprávnění
    const userPermissions = await getEffectivePermissionsForUser(session.user.id);
    if (!hasPermission(userPermissions, PERMISSIONS.COMMENTS_MODERATE)) {
      return NextResponse.json(
        { error: "Nemáte oprávnění k moderaci komentářů" },
        { status: 403 }
      );
    }

    const comment = await unmoderateComment(commentId, session.user.id);

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Error unhiding comment:", error);
    const errorMessage = error instanceof Error ? error.message : "Nepodařilo se zobrazit komentář";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

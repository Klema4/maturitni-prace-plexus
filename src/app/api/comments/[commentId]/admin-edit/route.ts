import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { editCommentAsAdmin } from "@/lib/services/commentsService";
import { getEffectivePermissionsForUser } from "@/lib/repositories/rolesRepository";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

type RouteParams = {
  params: Promise<{ commentId: string }>;
};

const AdminEditCommentSchema = z.object({
  content: z.string().min(1, "Komentář nemůže být prázdný").max(1000, "Komentář může mít maximálně 1000 znaků"),
});

/**
 * PATCH /api/comments/[commentId]/admin-edit
 * Úprava komentáře administrátorem (ADA-39)
 */
export async function PATCH(
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
        { error: "Pro úpravu komentáře se musíte přihlásit" },
        { status: 401 }
      );
    }

    const userPermissions = await getEffectivePermissionsForUser(session.user.id);
    if (!hasPermission(userPermissions, PERMISSIONS.COMMENTS_MODERATE)) {
      return NextResponse.json(
        { error: "Nemáte oprávnění k úpravě komentářů" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedBody = AdminEditCommentSchema.safeParse(body);
    if (!validatedBody.success) {
      return NextResponse.json(
        { error: validatedBody.error.issues[0]?.message || "Neplatná data" },
        { status: 400 }
      );
    }

    const comment = await editCommentAsAdmin(commentId, session.user.id, validatedBody.data.content);

    return NextResponse.json({ comment });
  } catch (error) {
    console.error("Error editing comment as admin:", error);
    const errorMessage = error instanceof Error ? error.message : "Nepodařilo se upravit komentář";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
